import { Stack } from "expo-router";
import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/onboarding";
import ProgressBar from "@/design-system/components/shared/progress-bar";

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
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
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
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="check-email"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="mode"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="birthday"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="group"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="create-group"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="invite-link"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="join-group"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
    </Stack>
  );
};

export default Layout;
