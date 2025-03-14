import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "@/design-system/base/animated-box";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
    }),
  };

  return (
    <Box
      paddingVertical="s"
      width="100%"
      gap="s"
      alignItems="center"
      justifyContent="center"
      flexDirection="row"
    >
      <Box
        height={8}
        width="100%"
        flexDirection="row"
        backgroundColor="honey"
        borderRadius="m"
        overflow="hidden"
      >
        <AnimatedBox height={8} backgroundColor="ink" style={animatedStyle} />
      </Box>
    </Box>
  );
};

export default ProgressBar;
