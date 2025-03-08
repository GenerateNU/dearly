import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/ui/text-button";

interface BackNextProps {
  onNext: () => void;
  onPrev: () => void;
  disableNext?: boolean;
  disablePrev?: boolean;
}

const BackNextButtons: React.FC<BackNextProps> = ({ onNext, onPrev, disableNext, disablePrev }) => {
  return (
    <Box flexDirection="row" gap="s">
      <Box width="50%" flexDirection="row" gap="s">
        <TextButton disabled={disablePrev} onPress={onPrev} label="Back" variant="blushRounded" />
      </Box>
      <Box width="50%" flexDirection="row" gap="s">
        <TextButton disabled={disableNext} onPress={onNext} label="Next" variant="honeyRounded" />
      </Box>
    </Box>
  );
};

export default BackNextButtons;
