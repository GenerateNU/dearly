import { router, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/provider";
import { advancedTheme, basicTheme } from "@/design-system/base/theme";
import { Mode } from "@/types/mode";

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isAuthenticated, mode } = useAuth();
  let theme = basicTheme;

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/(app)/(tabs)");
    } else {
      router.push("/(auth)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    theme = Mode.ADVANCED ? advancedTheme : basicTheme;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar />
          <InitialLayout />
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
