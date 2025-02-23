import React, { createContext, useContext, ReactNode } from "react";
import { useUserStore } from "./store";
import { AuthRequest } from "@/types/auth";
import { Mode } from "@/types/mode";
import { CreateUserPayload } from "@/types/user";
import { Group } from "@/types/group";

interface UserContextType {
  isAuthenticated: boolean;
  login: (data: AuthRequest) => Promise<void>;
  register: (data: CreateUserPayload & AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  userId: string | null;
  mode: Mode;
  group: Group | null;
  setMode: (mode: Mode) => void;
  setSelectedGroup: (group: Group) => void;
  setInviteToken: (inviteToken: string) => void;
  inviteToken: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    isAuthenticated,
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
  } = useUserStore();

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
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
