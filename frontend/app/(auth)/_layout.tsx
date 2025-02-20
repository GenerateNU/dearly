import React from "react";
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
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          headerTitle: "Register",
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          headerTitle: "Login",
          headerTransparent: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="components"
        options={{
          headerShown: true,
          headerTitle: "Components Library",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="design-system"
        options={{
          headerShown: true,
          headerTitle: "Design System",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
