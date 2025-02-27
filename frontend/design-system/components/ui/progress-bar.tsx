import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { Icon } from "./icon";
import { useOnboarding } from "@/contexts/onboarding";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedWidth = useSharedValue(0);
  const { page, setPage, isCreatingProfile, reset } = useOnboarding();

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  const handlePreviousPage = () => {
    if (page === 1) {
      setPage(0);
      reset();
      router.back();
    } else if (page > 1) {
      setPage(page - 1);
      router.back();
    }
  };

  return (
    <Box width="100%" gap="s" alignItems="center" justifyContent="center" flexDirection="row">
      <TouchableOpacity disabled={isCreatingProfile} activeOpacity={0.5}>
        <Icon
          onPress={isCreatingProfile ? undefined : handlePreviousPage}
          name="arrow-left-circle-outline"
        />
      </TouchableOpacity>
      <Box
        height={8}
        width="90%"
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
