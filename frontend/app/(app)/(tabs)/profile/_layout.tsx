import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { router, Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
          headerTransparent: false,
          headerShown: false,
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={() => router.navigate("/(app)/(tabs)/profile")} />,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={() => router.navigate("/(app)/(tabs)/profile")} />,
        }}
      />
    </Stack>
  );
}
