import { NudgeSettingsProvider } from "@/contexts/nudge-settings";
import Setting from "@/design-system/components/shared/buttons/setting";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import OptionsPopup from "@/design-system/components/shared/settings/options-popup";
import { useIsBasicMode } from "@/hooks/component/mode";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import { useRef } from "react";

const Layout = () => {
  const settingRef = useRef<BottomSheet>(null);
  const isBasic = useIsBasicMode();

  const onSettingPressed = () => {
    if (isBasic) {
      router.push("/(app)/group/settings");
    } else {
      settingRef.current?.snapToIndex(0);
    }
  };

  return (
    <NudgeSettingsProvider>
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
          <Stack.Screen
            name="switch"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTransparent: true,
              gestureEnabled: false,
              headerLeft: () => <BackIcon />,
            }}
          />
          <Stack.Screen
            name="settings"
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
    </NudgeSettingsProvider>
  );
};

export default Layout;
