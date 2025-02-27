import { router, SplashScreen, Stack } from "expo-router";
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

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isAuthenticated, clearError } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);

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
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setTimeout(() => {
        setShowSplash(false);
      }, 3000);
    } else {
      SplashScreen.preventAutoHideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    clearError();

    if (!showSplash) {
      if (isAuthenticated) {
        router.push("/(app)/(tabs)");
      } else {
        router.push("/(auth)");
      }
    }
  }, [isAuthenticated, showSplash, clearError, router]);

  // ask for notification permission
  useNotificationPermission();

  // ask for camera and audio permission
  useRequestDevicePermission();

  // listen for accessibility setting on device
  const scaleRatio = useAccessibility();

  return (
    <ThemeProvider theme={getTheme(scaleRatio * scaleFactor)}>
      {showSplash ? <SplashScreenAnimation /> : null}
      {!showSplash && (
        <Stack screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
      )}
    </ThemeProvider>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView>
      <NotificationProvider>
        <UserProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar />
            <InitialLayout />
          </QueryClientProvider>
        </UserProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
