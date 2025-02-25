import { useContext } from "react";
import { Stack } from "expo-router";
import ProgressBar from "@/design-system/components/ui/progress-bar";
import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingContext, OnboardingProvider } from "@/contexts/onboarding";

const Layout = () => {
  const { page } = useContext(OnboardingContext);
  const progress = page * 25;

  return (
    <OnboardingProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            gestureEnabled: false,
            header: () => (
              <SafeAreaView>
                <Box width="100%" paddingHorizontal="m">
                  <ProgressBar progress={progress} />
                </Box>
              </SafeAreaView>
            ),
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Onboarding Flow",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="check-email"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Onboarding Flow",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Onboarding Flow",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="mode"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Mode",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Welcome",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Edit Profile",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="birthday"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "Birthday",
            gestureEnabled: false,
          }}
        />
      </Stack>
    </OnboardingProvider>
  );
};

export default Layout;
