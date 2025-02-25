import { Stack } from "expo-router";
import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "@/design-system/components/ui/progress-bar";
import { OnboardingProvider, useOnboarding } from "@/contexts/onboarding";

const ProgressBarWrapper = () => {
  const { page } = useOnboarding();
  const progress = page * 25;

  return (
    <SafeAreaView>
      <Box width="100%" paddingHorizontal="m">
        <ProgressBar progress={progress} />
      </Box>
    </SafeAreaView>
  );
};

const Layout = () => {
  return (
    <OnboardingProvider>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTitle: "",
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
            header: () => <ProgressBarWrapper />,
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
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            gestureEnabled: false,
            header: () => <ProgressBarWrapper />,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "Edit Profile",
            gestureEnabled: false,
            header: () => <ProgressBarWrapper />,
          }}
        />
        <Stack.Screen
          name="birthday"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "Birthday",
            gestureEnabled: false,
            header: () => <ProgressBarWrapper />,
          }}
        />
      </Stack>
    </OnboardingProvider>
  );
};

export default Layout;
