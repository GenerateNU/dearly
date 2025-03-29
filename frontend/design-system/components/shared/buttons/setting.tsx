import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Icon } from "../icons/icon";
import { BaseButton } from "@/design-system/base/button";
import { useIsBasicMode } from "@/hooks/component/mode";

interface SettingProps {
  onPress: () => void;
}

const SettingButton: React.FC<SettingProps> = ({ onPress }) => {
  const isBasic = useIsBasicMode();

  return (
    <BaseButton onPress={onPress} variant="text">
      <Box justifyContent="center" alignItems="center" gap="xs" flexDirection="row">
        {isBasic && <Text variant="bodyBold">Settings</Text>}
        <Icon name="cog-outline" />
      </Box>
    </BaseButton>
  );
};

export default SettingButton;
