import { BaseButton } from "@/design-system/base/button";
import { MaterialIcon } from "@/types/icon";
import { Icon } from "./icon";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: MaterialIcon;
  variant: "iconHoney" | "iconBlush" | "iconGray" | "iconPearl" | "oneThirdHoneyRounded" | "oneThirdBlushRounded";
  size: number;
  color: string;
}


export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  size,
  icon,
  disabled = false,
  variant,
  color = "ink",
}) => {
  return (
    <Box width="auto" alignItems="center" justifyContent="center">
      <BaseButton activeOpacity={1} disabled={disabled} variant={variant} onPress={onPress}>
        <Box width="100%" gap="s" flexDirection="row" justifyContent="center" alignItems="center">
          <Icon name={icon} color={color} size={size} />
        </Box>
      </BaseButton>
    </Box>
  );
};
