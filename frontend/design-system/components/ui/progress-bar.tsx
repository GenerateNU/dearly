import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { Icon } from "./icon";
import { useOnboarding } from "@/contexts/onboarding";
import { router } from "expo-router";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedWidth = useSharedValue(0);
  const { page, setPage } = useOnboarding();

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    } else {
      router.back();
    }
  };

  const handleNextPage = () => {
    if (page <= 4) {
      setPage(page + 1);
    }
  };

  return (
    <Box width="100%" gap="s" alignItems="center" justifyContent="center" flexDirection="row">
      <Icon onPress={handlePreviousPage} name="arrow-left-circle-outline" />
      <Box
        height={8}
        width="80%"
        flexDirection="row"
        backgroundColor="honey"
        borderRadius="m"
        overflow="hidden"
      >
        <AnimatedBox height={8} backgroundColor="ink" style={animatedStyle} />
      </Box>
      <Icon onPress={handleNextPage} name="arrow-right-circle-outline" />
    </Box>
  );
};

export default ProgressBar;
