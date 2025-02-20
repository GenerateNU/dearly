import { useAuth } from "@/auth/provider";
import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/ui/icon";
import { Mode } from "@/types/mode";
import { Tabs } from "expo-router";
import React from "react";

const Layout = () => {
  const { mode } = useAuth();
  const hasLabel = mode === Mode.BASIC;

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
            title: "Home",
            headerShown: false,
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
