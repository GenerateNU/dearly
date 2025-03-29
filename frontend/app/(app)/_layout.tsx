import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { router, Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="group" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
      <Stack.Screen name="post-creation" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="logout" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
