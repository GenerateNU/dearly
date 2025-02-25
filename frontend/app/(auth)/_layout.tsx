import React, { createContext, useState } from "react";
import { Stack } from "expo-router";
import ProgressBar from "@/design-system/components/ui/progress-bar";
import { Box } from "@/design-system/base/box";

export const ProgressContext = createContext({
  progress: 0,
  setProgress: (p: number) => {},
});

const Layout = () => {
  const [progress, setProgress] = useState(0);

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
      <ProgressContext.Provider value={{ progress, setProgress }}>
        <Stack.Screen
          name="register"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            gestureEnabled: false,
            header: () => (
              <Box width="100%" paddingHorizontal="s" marginTop="s">
                <ProgressBar progress={progress} />
              </Box>
            ),
          }}
        />
      </ProgressContext.Provider>
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
