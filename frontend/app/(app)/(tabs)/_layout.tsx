import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/ui/icon";
import { useIsBasicMode } from "@/hooks/component/mode";
import { router, Tabs } from "expo-router";

const Layout = () => {
  const hasLabel = useIsBasicMode();

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
                    label={hasLabel ? "HOME" : undefined}
                    name="home"
                    color={focused ? "ink" : "slate"}
                  />
                </Box>
              );
            },
            headerRight: () => (
              <Box paddingRight="m">
                <Icon onPress={() => router.push("/(app)/notification")} name="bell-outline" />
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
                    label={hasLabel ? "POST" : undefined}
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
            title: "Profile",
            headerShown: false,
            headerTransparent: true,
            tabBarIcon: ({ focused }) => {
              return (
                <Box width={80}>
                  <Icon
                    navbar
                    labelPosition="bottom"
                    label={hasLabel ? "PROFILE" : undefined}
                    name="account-circle"
                    color={focused ? "ink" : "slate"}
                  />
                </Box>
              );
            },
          }}
        />
      </Tabs>
    </>
  );
};

export default Layout;
