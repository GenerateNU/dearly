import { Stack } from "expo-router";
import ProgressBarWrapper from "../components/progress-bar";

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
        name="signup"
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
    </Stack>
  );
};

export default Layout;
