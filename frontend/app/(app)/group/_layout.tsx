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
      </Stack>
      <OptionsPopup ref={settingRef} />
    </>
  );
};

export default Layout;
