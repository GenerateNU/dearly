import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerShown: true,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
