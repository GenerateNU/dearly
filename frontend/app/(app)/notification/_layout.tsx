import { BackIcon } from "@/design-system/components/ui/back-icon";
import { Stack } from "expo-router";

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
          headerLeft: () => <BackIcon />,
        }}
      />
    </Stack>
  );
};

export default Layout;
