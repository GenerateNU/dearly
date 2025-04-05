import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { useIsBasicMode } from "@/hooks/component/mode";
import { router, Stack, useSegments } from "expo-router";

export default function Layout() {
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];
  const handleBackPress = () => {
    if (currentScreen === "edit-profile" && segments[segments.length - 2] !== "profile") {
      router.navigate("/profile");
    } else {
      router.back();
    }
  };

  const basic = useIsBasicMode();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerShown: true,
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={handleBackPress} />,
        }}
      />
      <Stack.Screen
        name="name"
        options={{
          headerTransparent: !basic,
          headerLargeTitle: basic,
          headerLargeTitleShadowVisible: basic,
          headerTitle: basic ? "Name" : "",
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={handleBackPress} />,
        }}
      />
      <Stack.Screen
        name="bio"
        options={{
          headerTransparent: !basic,
          headerLargeTitle: basic,
          headerLargeTitleShadowVisible: basic,
          headerTitle: basic ? "Bio" : "",
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={handleBackPress} />,
        }}
      />
      <Stack.Screen
        name="birthday"
        options={{
          headerTransparent: !basic,
          headerLargeTitle: basic,
          headerLargeTitleShadowVisible: basic,
          headerTitle: basic ? "Birthday" : "",
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={handleBackPress} />,
        }}
      />
      <Stack.Screen
        name="username"
        options={{
          headerTransparent: !basic,
          headerLargeTitle: basic,
          headerLargeTitleShadowVisible: basic,
          headerTitle: basic ? "Username" : "",
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={handleBackPress} />,
        }}
      />
    </Stack>
  );
}
