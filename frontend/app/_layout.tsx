import { router, SplashScreen, Slot } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { useEffect, useState } from "react";
import { getTheme } from "@/design-system/base/theme";
import { NotificationProvider } from "@/contexts/notification";
import { useNotificationPermission } from "@/hooks/permission/notification";
import { useRequestDevicePermission } from "@/hooks/permission/device";
import { useFonts } from "expo-font";
import { useAccessibility } from "@/hooks/component/accessibility";
import { Dimensions } from "react-native";
import { BIGGER_PHONE_SCALE_RATIO, BIGGER_PHONE_SCREEN } from "@/constants/scale";
import { UserProvider } from "@/auth/provider";
import { useUserStore } from "@/auth/store";
import SplashScreenAnimation from "./(auth)/components/splash-screen";
import { OnboardingProvider } from "@/contexts/onboarding";

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isAuthenticated, clearError } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const { width } = Dimensions.get("window");
  const scaleFactor = width >= BIGGER_PHONE_SCREEN ? BIGGER_PHONE_SCALE_RATIO : 1;

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

        // Set a timeout for the splash screen animation
        setTimeout(() => {
          setShowSplash(false);
          setIsReady(true);
        }, 3000);

        clearError();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [fontsLoaded, clearError]);

  useEffect(() => {
    if (!showSplash && isReady) {
      if (isAuthenticated) {
        router.replace("/(app)/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    }
  }, [isAuthenticated, showSplash, isReady]);

  // ask for notification permission
  useNotificationPermission();

  // ask for camera and audio permission
  useRequestDevicePermission();

  // listen for accessibility setting on device
  const scaleRatio = useAccessibility();

  // Return the slot to ensure navigation container is mounted first
  return (
    <ThemeProvider theme={getTheme(scaleRatio * scaleFactor)}>
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
