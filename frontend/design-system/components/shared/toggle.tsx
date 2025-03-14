import { AnimatedBox } from "@/design-system/base/animated-box";
import { Box } from "@/design-system/base/box";
import { BaseButton } from "@/design-system/base/button";

interface ToggleProps {
  onToggle: () => void;
  isLoading: boolean;
  enabled: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ onToggle, enabled, isLoading }) => {
  return (
    <AnimatedBox
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      borderRadius="full"
      backgroundColor="honey"
      width={50}
      height={25}
    >
      <BaseButton onPress={() => console.log("left")} variant="text">
        <Box width={20} height={20}></Box>
      </BaseButton>
      <AnimatedBox
        shadowOpacity={0.4}
        shadowOffset={{ width: -0.5, height: 0 }}
        shadowRadius={5}
        shadowColor="ink"
        backgroundColor="pearl"
        borderRadius="full"
        width={20}
        height={20}
      />
      <BaseButton onPress={() => console.log("right")} variant="text">
        <Box width={20} height={20}></Box>
      </BaseButton>
    </AnimatedBox>
  );
};

export default Toggle;
