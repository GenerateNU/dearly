import { Stack } from "expo-router";
import ProgressBarWrapper from "./components/progress-bar";

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
        name="login"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
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
    </Stack>
  );
};

export default Layout;
