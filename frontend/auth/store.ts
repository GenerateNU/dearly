import { AuthService, SupabaseAuth } from "@/auth/service";
import { AUTH_ERROR_MESSAGE, ERROR_TIME } from "@/constants/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Mode } from "@/types/mode";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  error: string | null;
  isPending: boolean;
  mode: Mode;

  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  register: ({ email, password }: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: ({ email }: { email: string }) => Promise<void>;
  resetPassword: ({ password }: { password: string }) => Promise<void>;
  setMode: (mode: Mode) => void;
}

const authService: AuthService = new SupabaseAuth();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _) => ({
      isAuthenticated: false,
      userId: null,
      error: null,
      isPending: false,
      mode: Mode.BASIC,

      setMode: (mode: Mode) => {
        set({
          mode: mode,
        })
      },

      login: async ({ email, password }: { email: string; password: string }) => {
        set({ isPending: true });
        try {
          const session: Session = await authService.login({ email, password });
          set({
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
          });
        } catch (err) {
          handleError(err, set);
        }
      },

      register: async ({ email, password }: { email: string; password: string }) => {
        set({ isPending: true });
        try {
          const session: Session = await authService.signUp({
            email,
            password,
          });
          set({
            isAuthenticated: true,
            userId: session.user.id,
            isPending: false,
          });
        } catch (err) {
          handleError(err, set);
        }
      },

      forgotPassword: async ({ email }: { email: string }) => {
        try {
          await authService.forgotPassword({ email });
        } catch (err) {
          handleError(err, set);
        }
      },

      resetPassword: async ({ password }: { password: string }) => {
        try {
          await authService.resetPassword({ password });
          set({ error: null });
        } catch (err) {
          handleError(err, set);
        }
      },

      logout: async () => {
        try {
          await authService.logout();
          set({
            isAuthenticated: false,
            userId: null,
            isPending: false,
          });
        } catch (err) {
          handleError(err, set);
        }
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
const handleError = (err: unknown, set: (state: Partial<AuthState>) => void) => {
  const errorMessage = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
  set({ error: errorMessage });
  setTimeout(() => {
    set({ error: null });
  }, ERROR_TIME);
  set({ isPending: false });
};
