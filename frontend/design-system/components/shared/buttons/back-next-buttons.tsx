import { Box } from "@/design-system/base/box";
import { TextButton } from "./text-button";

interface BackNextProps {
  onNext: () => void;
  onPrev: () => void;
  disableNext?: boolean;
  disablePrev?: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

const BackNextButtons: React.FC<BackNextProps> = ({
  prevLabel,
  nextLabel,
  onNext,
  onPrev,
  disableNext,
  disablePrev,
}) => {
  return (
    <Box flexDirection="row" gap="s">
      <Box width="50%" flexDirection="row" gap="s">
        <TextButton
          disabled={disablePrev}
          onPress={onPrev}
          label={prevLabel ? prevLabel : "Back"}
          variant="secondary"
        />
      </Box>
      <Box width="50%" flexDirection="row" gap="s">
        <TextButton
          disabled={disableNext}
          onPress={onNext}
          label={nextLabel ? nextLabel : "Next"}
          variant="primary"
        />
      </Box>
    </Box>
  );
};

export default BackNextButtons;
