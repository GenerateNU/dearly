import { router, SplashScreen, Slot } from "expo-router";
import { Alert, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { useEffect, useState } from "react";
import { getTheme } from "@/design-system/base/theme";
import { NotificationProvider } from "@/contexts/notification";
import { useNotificationPermission } from "@/hooks/app/notification";
import { useRequestDevicePermission } from "@/hooks/app/device";
import { useFonts } from "expo-font";
import { useAccessibility } from "@/hooks/component/accessibility";
import { UserProvider } from "@/auth/provider";
import { useUserStore } from "@/auth/store";
import SplashScreenAnimation from "./(auth)/components/splash-screen";
import { OnboardingProvider } from "@/contexts/onboarding";
import { queryClient } from "@/auth/client";
import { useVerifyInviteToken } from "@/hooks/api/group";
import * as Linking from "expo-linking";
import AddMemberLoading from "@/design-system/components/shared/add-member";

const InitialLayout = () => {
  const { isAuthenticated, clearError, completeOnboarding, setInviteToken, inviteToken } =
    useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [deeplinkToken, setDeeplinkToken] = useState<string | undefined>(undefined);
  const [hasProcessedInitialLink, setHasProcessedInitialLink] = useState(false);

  const { mutate, isPending, error } = useVerifyInviteToken();

  const [fontsLoaded] = useFonts({
    Black: require("../assets/fonts/proximanova_black.ttf"),
    ExtraBold: require("../assets/fonts/proximanova_extrabold.otf"),
    Bold: require("../assets/fonts/proximanova_bold.otf"),
    Regular: require("../assets/fonts/proximanova_regular.ttf"),
    Light: require("../assets/fonts/proximanova_light.otf"),
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Invalid or expired link. Please ask for a new link.", [{ text: "OK" }]);
    }
  }, [error]);

  // process initial link once (if there is one when component mounts)
  useEffect(() => {
    if (hasProcessedInitialLink) return;

    const getInitialLink = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const { queryParams } = Linking.parse(initialUrl);
          if (queryParams && queryParams.token) {
            setDeeplinkToken(queryParams.token as string);
          }
        }
      } catch (e) {
        console.error("Error processing initial link:", e);
      }
      setHasProcessedInitialLink(true);
    };

    getInitialLink();
  }, [hasProcessedInitialLink]);

  useEffect(() => {
    const handleLink = (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams && queryParams.token) {
        setDeeplinkToken(queryParams.token as string);
      }
    };

    const subscription = Linking.addEventListener("url", handleLink);
    return () => subscription.remove();
  }, []);

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

    if (!isAuthenticated) {
      if (deeplinkToken) {
        setInviteToken(deeplinkToken);
      }
      return router.replace("/(auth)");
    }

    if (!completeOnboarding) {
      return router.replace("/(auth)/group");
    }

    if (inviteToken) {
      mutate(inviteToken);
    }

    if (deeplinkToken) {
      mutate(deeplinkToken);
    }

    setInviteToken("");
    setDeeplinkToken(undefined);
    return router.replace("/(app)/(tabs)");
  }, [isAuthenticated, completeOnboarding, showSplash, isReady, deeplinkToken]);

  // ask for notification permission
  useNotificationPermission();

  // ask for camera and audio permission
  useRequestDevicePermission();

  // listen for accessibility setting on device
  const scaleRatio = useAccessibility();

  // return the slot to ensure navigation container is mounted first
  return (
    <ThemeProvider theme={getTheme(scaleRatio)}>
      {showSplash ? (
        <SplashScreenAnimation />
      ) : (
        <>
          <Slot />
          {isPending && <AddMemberLoading />}
        </>
      )}
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
