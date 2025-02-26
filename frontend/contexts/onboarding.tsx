import { Mode } from "@/types/mode";
import { router } from "expo-router";
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";

interface User {
  email: string;
  username: string;
  password: string;
  mode: Mode;
  profilePicture: string | null;
  displayName: string;
  birthday: Date | null;
}

interface OnboardingContextType {
  user: User;
  setUser: (updatedUser: Partial<User>) => void;
  page: number;
  setPage: (page: number) => void;
  popupVisible: boolean;
  setPopupVisible: (visible: boolean) => void;
  reset: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  user: {
    email: "",
    username: "",
    password: "",
    mode: Mode.BASIC,
    profilePicture: "",
    displayName: "",
    birthday: null,
  },
  setUser: () => {},
  page: 0,
  setPage: () => {},
  popupVisible: false,
  setPopupVisible: () => {},
  reset: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    email: "",
    username: "",
    password: "",
    mode: Mode.BASIC,
    profilePicture: "",
    displayName: "",
    birthday: new Date(),
  });

  const [page, setPage] = useState<number>(0);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  useEffect(() => {
    const navigateToPage = () => {
      if (prevPage !== null && page < prevPage) {
        router.back();
        if (page === 0) reset();
        return;
      }
      switch (page) {
        case 0:
          router.push("/(auth)");
          break;
        case 1:
          router.push("/(auth)/register");
          break;
        case 2:
          router.push("/(auth)/mode");
          break;
        case 3:
          router.push("/(auth)/edit-profile");
          break;
        case 4:
          router.push("/(auth)/birthday");
          break;
        default:
          break;
      }
    };
    setPrevPage(page);
    navigateToPage();
  }, [page]);

  const handleSetUser = (updatedUser: Partial<User>) => {
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
      profilePicture: "",
      displayName: "",
      birthday: null,
    });
    setPage(0);
    setPopupVisible(false);
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
