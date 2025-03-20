import { RemoveMemberProvider } from "@/contexts/remove-meber";
import Setting from "@/design-system/components/shared/buttons/setting";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import OptionsPopup from "@/design-system/components/shared/settings/options-popup";
import BottomSheet from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useRef } from "react";

const Layout = () => {
  const settingRef = useRef<BottomSheet>(null);

  const onSettingPressed = () => {
    settingRef.current?.snapToIndex(0);
  };

  return (
    <RemoveMemberProvider>
      <>
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
            name="change-name"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
          <Stack.Screen
            name="set-nudge"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
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
          <Stack.Screen
            name="member"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
              headerRight: () => <Setting onPress={onSettingPressed} />,
            }}
          />
          <Stack.Screen
            name="add-member"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
          <Stack.Screen
            name="delete"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
          <Stack.Screen
            name="remove"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
          <Stack.Screen
            name="leave"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
        </Stack>
        <OptionsPopup ref={settingRef} />
      </>
    </RemoveMemberProvider>
  );
};

export default Layout;
