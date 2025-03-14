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
        name="create"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="invite"
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          header: () => <ProgressBarWrapper />,
        }}
      />
      <Stack.Screen
        name="join"
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
