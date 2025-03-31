import { Stack } from "expo-router";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { useUserStore } from "@/auth/store";
import RemoveMemberPopUp from "@/design-system/components/shared/settings/remove-member-popup";
import { useRemoveMemberContext } from "@/contexts/remove-meber";
import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { Text } from "@/design-system/base/text";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { useIsBasicMode } from "@/hooks/component/mode";

const Layout = () => {
  const { group, userId } = useUserStore();
  const { user } = useRemoveMemberContext();
  const isManager = userId === group?.managerId;
  const manageRef = useRef<BottomSheet>(null);
  const isBasicMode = useIsBasicMode();
  const isSameUser = user?.id === userId;

  const onPress = () => manageRef.current?.snapToIndex(0);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            gestureEnabled: false,
            headerLeft: () => <BackIcon />,
            headerRight:
              isManager && !isSameUser
                ? () => (
                    <Box flexDirection="row" alignItems="center">
                      {isBasicMode && <Text variant="bodyBold">Manage</Text>}
                      <Icon onPress={onPress} name="dots-vertical" />
                    </Box>
                  )
                : () => null,
          }}
        />
        <Stack.Screen
          name="mode"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            gestureEnabled: false,
            headerLeft: () => <BackIcon />,
          }}
        />
      </Stack>
      <RemoveMemberPopUp ref={manageRef} />
    </>
  );
};

export default Layout;
