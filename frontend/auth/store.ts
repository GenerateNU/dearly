import { AuthService, SupabaseAuth } from "@/auth/service";
import { AUTH_ERROR_MESSAGE, ERROR_TIME } from "@/constants/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Mode } from "@/types/mode";
import { createUser, getUser } from "@/api/user";
import { NOTIFICATION_TOKEN_KEY } from "@/constants/notification";
import { unregisterDeviceToken } from "@/api/device";
import { getExpoDeviceToken } from "@/utilities/device-token";
import { Group } from "@/types/group";
import * as SecureStore from "expo-secure-store";
import { OnboardingUserInfo } from "@/contexts/onboarding";
import { uploadUserMedia } from "@/api/media";
import { getProfilePhotoBlob } from "@/utilities/media";
import { ResetPasswordPayload } from "@/types/auth";

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  error: string | null;
  isPending: boolean;
  inviteToken: string | null;
  mode: Mode;
  group: Group | null;
  email: string | null;
  completeOnboarding: boolean;

  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  register: (data: OnboardingUserInfo) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email?: string) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  setMode: (mode: Mode) => void;
  setSelectedGroup: (group: Group) => void;
  setInviteToken: (inviteToken: string) => void;
  loginWithBiometrics: () => Promise<void>;
  clearError: () => void;
  finishOnboarding: () => void;
}

const authService: AuthService = new SupabaseAuth();

const userWrapper = async (
  userFn: () => Promise<void>,
  onFailure: (error: unknown) => Promise<void>,
) => {
  try {
    await userFn();
  } catch (error) {
    await onFailure(error);
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, _) => ({
      isAuthenticated: false,
      userId: null,
      error: null,
      isPending: false,
      mode: Mode.BASIC,
      inviteToken: null,
      group: null,
      email: null,
      completeOnboarding: false,

      setMode: (mode: Mode) => {
        set({ mode });
      },

      finishOnboarding: () => {
        set({ completeOnboarding: true });
      },

      setSelectedGroup: (group: Group) => {
        set({ group });
      },

      setInviteToken: (inviteToken: string) => {
        set({ inviteToken });
      },

      loginWithBiometrics: async () => {
        const biomentricsImpl = async () => {
          set({ isPending: true });
          const session: Session = await authService.loginWithBiometrics();
          const user = await getUser(session.user.id);
          set({
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
            mode: user.mode as Mode,
            completeOnboarding: true,
          });
        };
        const failureImpl = async (err: unknown) => {
          await useUserStore.getState().logout();
          handleError(err, set);
        };
        await userWrapper(biomentricsImpl, failureImpl);
      },

      clearError: () => {
        set({ error: null });
      },

      login: async ({ email, password }: { email: string; password: string }) => {
        const loginImpl = async () => {
          set({ isPending: true });
          const session: Session = await authService.login({ email, password });
          const user = await getUser(session.user.id);
          set({
            isAuthenticated: true,
            userId: session.user.id,
            mode: user.mode as Mode,
            isPending: false,
            completeOnboarding: true,
          });
          await authService.storeLocalSessionToDevice(email, password);
        };
        const failureImpl = async (err: unknown) => {
          await useUserStore.getState().logout();
          handleError(err, set);
        };
        await userWrapper(loginImpl, failureImpl);
      },

      register: async (data: OnboardingUserInfo) => {
        const registerImpl = async () => {
          set({ isPending: true });
          const session: Session = await authService.signUp({
            email: data.email,
            password: data.password,
          });
          let objectKey: string | undefined;
          if (data.profilePhoto) {
            const form = await getProfilePhotoBlob(data.profilePhoto);
            const response = await uploadUserMedia(form);
            objectKey = response.objectKey;
          }
          await createUser({
            name: data.name,
            username: data.username,
            mode: data.mode,
            profilePhoto: objectKey,
            birthday: data.birthday,
          });
          set({
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
          });
          await authService.storeLocalSessionToDevice(data.email, data.password);
        };
        const errorImpl = async (err: unknown) => {
          handleError(err, set);
          await useUserStore.getState().logout();
        };
        await userWrapper(registerImpl, errorImpl);
      },

      forgotPassword: async (email?: string) => {
        await userWrapper(
          async () => {
            if (email) {
              await authService.forgotPassword({ email });
              set({ email: email });
              return;
            }
            const savedEmail = await useUserStore.getState().email;
            if (savedEmail) {
              await authService.forgotPassword({ email: savedEmail });
            } else {
              throw new Error("No email found.");
            }
          },
          async (err: unknown) => {
            handleError(err, set);
          },
        );
      },

      resetPassword: async (payload: ResetPasswordPayload) => {
        await userWrapper(
          async () => {
            set({ isPending: true });
            await authService.resetPassword(payload);
            set({ error: null });
            const validEmail = SecureStore.getItem("email");
            if (!validEmail) {
              throw new Error("No email found.");
            }
            await authService.storeLocalSessionToDevice(validEmail, payload.password);
            set({ isPending: false });
          },
          async (err: unknown) => {
            handleError(err, set);
          },
        );
      },

      logout: async () => {
        const logoutImpl = async () => {
          const expoToken = await getExpoDeviceToken();
          const savedToken = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
          if (savedToken && expoToken) {
            await unregisterDeviceToken(expoToken);
            await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
          }
          await authService.logout();
          set({
            isAuthenticated: false,
            userId: null,
            isPending: false,
            mode: Mode.BASIC,
            error: null,
            completeOnboarding: false,
          });
        };
        const errorImpl = async (err: unknown) => {
          handleError(err, set);
        };
        await userWrapper(logoutImpl, errorImpl);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Handle displaying the error for auth actions.
 * @param err error
 * @param set setter function to mutate auth statte
 */
const handleError = async (err: unknown, set: (state: Partial<UserState>) => void) => {
  const errorMessage = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
  if (errorMessage === "user_cancel" || errorMessage === "system_cancel") {
    return;
  }
  set({ error: errorMessage });
  setTimeout(() => {
    set({ error: null });
  }, ERROR_TIME);
  set({ isPending: false });
};
