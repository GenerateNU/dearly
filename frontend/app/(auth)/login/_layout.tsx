import { Stack } from "expo-router";

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
        name="check-email"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
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
        name="reset-password"
        options={{
          headerShown: false,
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
