import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="group" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false }} />
      <Stack.Screen name="post-creation" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="logout" options={{ headerShown: false }} />
      <Stack.Screen name="view-post" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="comment" options={{ headerShown: false }} />
      <Stack.Screen name="likes" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
