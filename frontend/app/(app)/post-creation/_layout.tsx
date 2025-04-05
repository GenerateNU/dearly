import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { router, Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          gestureEnabled: false,
          headerLeft: () => <BackIcon onPress={() => router.navigate("/(app)/(tabs)")} />,
        }}
      />
    </Stack>
  );
};

export default Layout;
