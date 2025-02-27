import { Mode } from "@/types/mode";
import React, { createContext, useState, ReactNode, useContext } from "react";

export interface OnboardingUserInfo {
  email: string;
  username: string;
  password: string;
  mode: Mode;
  profilePhoto: string | null;
  name: string;
  birthday: Date | null;
}

interface OnboardingContextType {
  user: OnboardingUserInfo;
  setUser: (updatedUser: Partial<OnboardingUserInfo>) => void;
  page: number;
  setPage: (page: number) => void;
  popupVisible: boolean;
  setPopupVisible: (visible: boolean) => void;
  reset: () => void;
  isCreatingProfile: boolean;
  setIsCreatingProfile: (isCreating: boolean) => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  user: {
    email: "",
    username: "",
    password: "",
    mode: Mode.BASIC,
    profilePhoto: "",
    name: "",
    birthday: null,
  },
  setUser: () => {},
  page: 0,
  setPage: () => {},
  popupVisible: false,
  setPopupVisible: () => {},
  reset: () => {},
  isCreatingProfile: false,
  setIsCreatingProfile: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<OnboardingUserInfo>({
    email: "",
    username: "",
    password: "",
    mode: Mode.BASIC,
    profilePhoto: "",
    name: "",
    birthday: new Date(),
  });

  const [page, setPage] = useState<number>(0);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);

  const handleSetUser = (updatedUser: Partial<OnboardingUserInfo>) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  const reset = () => {
    setUser({
      email: "",
      username: "",
      password: "",
      mode: Mode.BASIC,
      profilePhoto: "",
      name: "",
      birthday: null,
    });
    setPage(0);
    setPopupVisible(false);
    setIsCreatingProfile(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        page,
        setPage,
        popupVisible,
        setPopupVisible,
        reset,
        isCreatingProfile,
        setIsCreatingProfile,
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
