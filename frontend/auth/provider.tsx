import React, { createContext, useContext, ReactNode } from "react";
import { useAuthStore } from "./store";
import { AuthRequest } from "@/types/auth";
import { Mode } from "@/types/mode";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (data: AuthRequest) => Promise<void>;
  register: (data: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  userId: string | null;
  mode: Mode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, login, register, logout, userId, mode } = useAuthStore();

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, userId, mode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
