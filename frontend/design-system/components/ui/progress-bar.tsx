import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "@/design-system/base/animated-box";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

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
