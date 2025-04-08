import { Box } from "@/design-system/base/box";
import SwitchGroupButton from "@/design-system/components/shared/buttons/select-group";
import Setting from "@/design-system/components/shared/buttons/setting";
import { Icon } from "@/design-system/components/shared/icons/icon";
import SettingPopup from "@/design-system/components/shared/settings/setting-popup";
import SwitchGroupBottomSheet from "@/design-system/components/shared/switch-group/switch-group-sheet";
import { useIsBasicMode } from "@/hooks/component/mode";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, Tabs } from "expo-router";
import { useRef } from "react";

const Layout = () => {
  const isBasic = useIsBasicMode();
  const switchGroupRef = useRef<BottomSheet>(null);
  const settingRef = useRef<BottomSheet>(null);

  const onSwitchGroup = () => {
    if (isBasic) {
      router.push("/(app)/group/switch");
    } else {
      switchGroupRef.current?.snapToIndex(0);
    }
  };

  const onSettingPressed = () => {
    if (isBasic) {
      router.navigate("/(app)/settings");
    } else {
      settingRef.current?.snapToIndex(0);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            borderTopColor: "gray",
            height: 100,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            tabBarIcon: ({ focused }) => {
              return (
                <Box width={50}>
                  <Icon
                    navbar
                    labelPosition="bottom"
                    label={isBasic ? "HOME" : undefined}
                    name="home"
                    color={focused ? "ink" : "slate"}
                  />
                </Box>
              );
            },
            headerStyle: {
              height: 100,
            },
            headerRight: () => (
              <Box paddingRight="m">
                <Icon onPress={() => router.push("/(app)/notification")} name="bell-outline" />
              </Box>
            ),
            headerLeft: () => (
              <Box paddingLeft="m">
                <SwitchGroupButton onPress={onSwitchGroup} />
              </Box>
            ),
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: "Post",
            headerShown: false,
            headerTransparent: true,
            tabBarIcon: ({ focused }) => {
              return (
                <Box width={50}>
                  <Icon
                    navbar
                    labelPosition="bottom"
                    label={isBasic ? "POST" : undefined}
                    name="plus-circle"
                    color={focused ? "ink" : "slate"}
                  />
                </Box>
              );
            },
            href: "/(app)/post-creation",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "",
            headerShown: true,
            headerTransparent: false,
            tabBarIcon: ({ focused }) => {
              return (
                <Box width={80}>
                  <Icon
                    navbar
                    labelPosition="bottom"
                    label={isBasic ? "PROFILE" : undefined}
                    name="account-circle"
                    color={focused ? "ink" : "slate"}
                  />
                </Box>
              );
            },
            headerStyle: {
              height: 100,
              backgroundColor: "pearl",
            },
            headerLeft: () => (
              <Box paddingLeft="m">
                <SwitchGroupButton onPress={onSwitchGroup} />
              </Box>
            ),
            headerRight: () => (
              <Box paddingRight="m" backgroundColor="pearl" borderRadius="m" padding="xs">
                <Setting onPress={onSettingPressed} />
              </Box>
            ),
          }}
        />
      </Tabs>
      <SwitchGroupBottomSheet ref={switchGroupRef} />
      <SettingPopup close={() => settingRef.current?.close()} ref={settingRef} />
    </>
  );
};

export default Layout;
