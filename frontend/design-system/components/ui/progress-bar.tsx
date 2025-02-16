import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "@/design-system/base/animated-box";

interface ProgressBarProps {
  progress: number; // progress percentage, between 0 and 100
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300, // sliding animation 300 ms
      useNativeDriver: false,
    }).start();
  }, [progress]); // runs when the progress changes

  return (
    <Box backgroundColor="pearl" width="auto" borderRadius="m" overflow="hidden">
      <AnimatedBox
        height={2}
        backgroundColor="gray"
        style={{
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </Box>
  );
};

export default ProgressBar;
