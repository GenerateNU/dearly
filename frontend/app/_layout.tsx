import { router, SplashScreen, Slot } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { useEffect, useState } from "react";
import { getTheme } from "@/design-system/base/theme";
import { NotificationProvider } from "@/contexts/notification";
import { useNotificationPermission } from "@/hooks/permission/notification";
import { useRequestDevicePermission } from "@/hooks/permission/device";
import { useFonts } from "expo-font";
import { useAccessibility } from "@/hooks/component/accessibility";
import { UserProvider } from "@/auth/provider";
import { useUserStore } from "@/auth/store";
import SplashScreenAnimation from "./(auth)/components/splash-screen";
import { OnboardingProvider } from "@/contexts/onboarding";
import { queryClient } from "@/auth/client";

const InitialLayout = () => {
  const { isAuthenticated, clearError, completeOnboarding, group } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Black: require("../assets/fonts/proximanova_black.ttf"),
    ExtraBold: require("../assets/fonts/proximanova_extrabold.otf"),
    Bold: require("../assets/fonts/proximanova_bold.otf"),
    Regular: require("../assets/fonts/proximanova_regular.ttf"),
    Light: require("../assets/fonts/proximanova_light.otf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (!fontsLoaded) {
          await SplashScreen.preventAutoHideAsync();
          return;
        }

        await SplashScreen.hideAsync();

        setTimeout(() => {
          setShowSplash(false);
          setIsReady(true);
        }, 3000);

        clearError();
      } catch (error) {
        console.warn(error);
      }
    }

    prepare();
  }, [fontsLoaded, clearError]);

  useEffect(() => {
    if (showSplash || !isReady) return;

    if (isAuthenticated && !completeOnboarding) {
      router.replace("/(auth)/group");
    } else if (isAuthenticated && completeOnboarding) {
      router.replace("/(app)/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isAuthenticated, completeOnboarding, showSplash, isReady]);

  // ask for notification permission
  useNotificationPermission();

  // ask for camera and audio permission
  useRequestDevicePermission();

  // listen for accessibility setting on device
  const scaleRatio = useAccessibility();

  // return the slot to ensure navigation container is mounted first
  return (
    <ThemeProvider theme={getTheme(scaleRatio)}>
      {showSplash ? <SplashScreenAnimation /> : <Slot />}
    </ThemeProvider>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <UserProvider>
          <QueryClientProvider client={queryClient}>
            <OnboardingProvider>
              <StatusBar />
              <InitialLayout />
            </OnboardingProvider>
          </QueryClientProvider>
        </UserProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
