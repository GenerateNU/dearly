import { AuthService, SupabaseAuth } from "@/auth/service";
import { AUTH_ERROR_MESSAGE, ERROR_TIME } from "@/constants/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Mode } from "@/types/mode";
import { CreateUserPayload } from "@/types/user";
import { AuthRequest } from "@/types/auth";
import { createUser, getUser } from "@/api/user";
import { NOTIFICATION_TOKEN_KEY } from "@/constants/notification";
import { unregisterDeviceToken } from "@/api/device";
import { getExpoDeviceToken } from "@/utilities/device-token";
import { Group } from "@/types/group";

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  error: string | null;
  isPending: boolean;
  inviteToken: string | null;
  mode: Mode;
  group: Group | null;

  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  register: (data: CreateUserPayload & AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: ({ email }: { email: string }) => Promise<void>;
  resetPassword: ({ password }: { password: string }) => Promise<void>;
  setMode: (mode: Mode) => void;
  setSelectedGroup: (group: Group) => void;
  setInviteToken: (inviteToken: string) => void;
  loginWithBiometrics: () => Promise<void>;
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

      setMode: (mode: Mode) => {
        set({ mode });
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
          const session: Session = await authService.loginWithBiometrics()
          const user = await getUser(session.user.id)
          set({
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
          });
          set({
            mode: user.mode as Mode,
          });
        }
        const failureImpl = async (err: unknown) => {
          await useUserStore.getState().logout();
          handleError(err, set);
        };
        await userWrapper(biomentricsImpl, failureImpl)
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
          });
          await authService.storeLocalSessionToDevice()
        };
        const failureImpl = async (err: unknown) => {
          await useUserStore.getState().logout();
          handleError(err, set);
        };
        await userWrapper(loginImpl, failureImpl);
      },

      register: async (data: CreateUserPayload & AuthRequest) => {
        const registerImpl = async () => {
          set({ isPending: true });
          const session: Session = await authService.signUp({
            email: data.email,
            password: data.password,
          });
          const user = await createUser(data);
          set({
            mode: user.mode as Mode,
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
          });
          await authService.storeLocalSessionToDevice()
        };
        const errorImpl = async (err: unknown) => {
          await useUserStore.getState().logout();
          handleError(err, set);
        };
        await userWrapper(registerImpl, errorImpl);
      },

      forgotPassword: async ({ email }: { email: string }) => {
        await userWrapper(
          async () => {
            await authService.forgotPassword({ email });
          },
          async (err: unknown) => {
            handleError(err, set);
          },
        );
      },

      resetPassword: async ({ password }: { password: string }) => {
        await userWrapper(
          async () => {
            await authService.resetPassword({ password });
            set({ error: null });
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
          });
        }
        const errorImpl = async (err: unknown) => {
          handleError(err, set);
        }
        await userWrapper(logoutImpl, errorImpl)
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log("Rehydrating state...");
      },
    },
  ),
);

/**
 * Handle displaying the error for auth actions.
 * @param err error
 * @param set setter function to mutate auth statte
 */
const handleError = (err: unknown, set: (state: Partial<UserState>) => void) => {
  const errorMessage = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
  set({ error: errorMessage });
  setTimeout(() => {
    set({ error: null });
  }, ERROR_TIME);
  set({ isPending: false });
};
