import { BaseButton } from "@/design-system/base/button";
import { MaterialIcon } from "@/types/icon";
import { Icon } from "../icons/icon";
import { ButtonVariant } from "@/design-system/base/variants/button";
import { Box } from "@/design-system/base/box";

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: MaterialIcon;
  variant: ButtonVariant;
  label?: string;
  labelPosition?: "left" | "right" | "bottom" | "top";
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  disabled = false,
  variant,
  label,
  labelPosition,
  size,
}) => {
  return (
    <Box alignItems="center" justifyContent="center">
      <BaseButton activeOpacity={1} disabled={disabled} variant={variant} onPress={onPress}>
        <Icon labelPosition={labelPosition} label={label} name={icon} color="ink" size={size} />
      </BaseButton>
    </Box>
  );
};
