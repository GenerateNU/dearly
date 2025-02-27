import { createContext, useContext, ReactNode } from "react";
import { useUserStore } from "./store";
import { AuthRequest } from "@/types/auth";
import { Mode } from "@/types/mode";
import { Group } from "@/types/group";
import { OnboardingUserInfo } from "@/contexts/onboarding";

interface UserContextType {
  isAuthenticated: boolean;
  login: (data: AuthRequest) => Promise<void>;
  register: (data: OnboardingUserInfo) => Promise<void>;
  logout: () => Promise<void>;
  userId: string | null;
  mode: Mode;
  group: Group | null;
  setMode: (mode: Mode) => void;
  setSelectedGroup: (group: Group) => void;
  setInviteToken: (inviteToken: string) => void;
  inviteToken: string | null;
  loginWithBiometrics: () => Promise<void>;
  forgotPassword: (email?: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    isAuthenticated,
    loginWithBiometrics,
    login,
    register,
    logout,
    userId,
    mode,
    setMode,
    setInviteToken,
    inviteToken,
    group,
    setSelectedGroup,
    forgotPassword,
    resetPassword,
  } = useUserStore();

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        loginWithBiometrics,
        login,
        setSelectedGroup,
        group,
        register,
        logout,
        userId,
        mode,
        setMode,
        setInviteToken,
        inviteToken,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserState = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within an AuthProvider");
  }
  return context;
};
