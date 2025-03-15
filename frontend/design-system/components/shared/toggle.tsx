import { AnimatedBox } from "@/design-system/base/animated-box";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Theme } from "@/design-system/base/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState, useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";

interface ToggleProps {
  onToggle: () => void;
  enabled: boolean;
  label: string;
  isPending?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ onToggle, enabled, label, isPending = false }) => {
  const theme = useTheme<Theme>();
  const WIDTH = 60;
  const HEIGHT = WIDTH / 2;
  const BUFFER = 5;
  const CIRCLE_SIZE = HEIGHT - BUFFER;
  const MOVEMENT_DISTANCE = WIDTH - CIRCLE_SIZE - BUFFER;

  const [backgroundColor] = useState(new Animated.Value(enabled ? 1 : 0));
  const [buttonPosition] = useState(new Animated.Value(enabled ? MOVEMENT_DISTANCE : 0));

  useEffect(() => {
    Animated.timing(backgroundColor, {
      toValue: enabled ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(buttonPosition, {
      toValue: enabled ? MOVEMENT_DISTANCE : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [enabled, MOVEMENT_DISTANCE]);

  const interpolatedBackgroundColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.gray, theme.colors.honey],
  });

  return (
    <Box justifyContent="space-between" width="100%" flexDirection="row" alignItems="center">
      <Text color="ink" variant="bodyBold">
        {label}
      </Text>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} disabled={isPending}>
        <AnimatedBox
          style={{
            borderRadius: HEIGHT / 2,
            width: WIDTH,
            height: HEIGHT,
            backgroundColor: interpolatedBackgroundColor,
            padding: 3,
            justifyContent: "center",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <AnimatedBox
            style={{
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 2,
              shadowColor: "#000",
              backgroundColor: theme.colors.pearl || "#ffffff",
              borderRadius: CIRCLE_SIZE / 2,
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              transform: [{ translateX: buttonPosition }],
              justifyContent: "center",
              alignItems: "center",
            }}
          ></AnimatedBox>
        </AnimatedBox>
      </TouchableOpacity>
    </Box>
  );
};

export default Toggle;
