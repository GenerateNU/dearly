import { Stack, router } from "expo-router";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";

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
          headerLeft: () => <BackIcon/>,
        }}
      />
    </Stack>
  );
};

export default Layout;
