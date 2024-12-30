import { Tabs } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            borderTopColor: "gray",
            height: 80,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 8,
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
          }}
        />
      </Tabs>
    </>
  );
};

export default Layout;
