import { router, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/provider";
import { advancedTheme, basicTheme } from "@/design-system/base/theme";
import { NotificationProvider } from "@/contexts/notification";
import { useNotificationPermission } from "@/hooks/notification";
import { Mode } from "@/types/mode";
import { useRequestPermission } from "@/hooks/permission";

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isAuthenticated, mode } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/(app)/(tabs)");
    } else {
      router.push("/(auth)");
    }
  }, [isAuthenticated]);

  // ask for notification permission
  useNotificationPermission();

  // ask for camera and audio permission
  useRequestPermission();

  return (
    <ThemeProvider theme={mode === Mode.ADVANCED ? advancedTheme : basicTheme}>
      <Stack screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView>
      <NotificationProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar />
            <InitialLayout />
          </QueryClientProvider>
        </AuthProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
