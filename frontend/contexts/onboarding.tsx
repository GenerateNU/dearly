import { Mode } from "@/types/mode";
import React, { createContext, useState, ReactNode, useContext } from "react";

interface User {
  email: string;
  username: string;
  password: string;
  mode: Mode | null;
  profilePicture: Blob | null;
  displayName: string;
  birthday: string;
}

interface OnboardingContextType {
  user: User;
  setUser: (updatedUser: Partial<User>) => void;
  page: number;
  setPage: (page: number) => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  user: {
    email: "",
    username: "",
    password: "",
    mode: null,
    profilePicture: null,
    displayName: "",
    birthday: "",
  },
  setUser: () => {},
  page: 0,
  setPage: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    email: "",
    username: "",
    password: "",
    mode: null,
    profilePicture: null,
    displayName: "",
    birthday: "",
  });

  const [page, setPage] = useState<number>(0);

  const handleSetUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        page,
        setPage,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used within a OnboardingProvider");
  }

  return context;
};
