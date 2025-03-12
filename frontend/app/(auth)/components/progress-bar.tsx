import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import ProgressBar from "@/design-system/components/shared/progress-bar";
import { SafeAreaView } from "react-native";

const ProgressBarWrapper = () => {
  const { page } = useOnboarding();
  const progress = page * 25;

  return (
    <SafeAreaView>
      <Box width="100%" paddingHorizontal="m">
        <ProgressBar progress={progress} />
      </Box>
    </SafeAreaView>
  );
};

export default ProgressBarWrapper;
