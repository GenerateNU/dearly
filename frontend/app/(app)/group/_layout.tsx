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
        name="invite"
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
