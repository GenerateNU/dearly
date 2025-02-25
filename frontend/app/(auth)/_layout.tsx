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
          headerShown: false,
          headerTitle: "Register",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
          headerTransparent: true,
          headerTitle: "Onboarding Flow",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
          headerTransparent: true,
          headerTitle: "Onboarding Flow",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="check-email"
        options={{
          headerShown: false,
          headerTransparent: true,
          headerTitle: "Onboarding Flow",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
          headerTransparent: true,
          headerTitle: "Onboarding Flow",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
