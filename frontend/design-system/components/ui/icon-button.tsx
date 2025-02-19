import { BaseButton } from "@/design-system/base/button";
import { MaterialIcon } from "@/types/icon";
import { Icon } from "./icon";
import { Box } from "@/design-system/base/box";
import { ButtonVariant } from "@/design-system/base/variants/button";

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: MaterialIcon;
  variant: ButtonVariant;
  size: number;
  label?: string;
  labelPosition?: "left" | "right" | "bottom" | "top";
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  size,
  icon,
  disabled = false,
  variant,
  label,
  labelPosition,
}) => {
  return (
    <Box width="auto" alignItems="center" justifyContent="center">
      <BaseButton activeOpacity={1} disabled={disabled} variant={variant} onPress={onPress}>
        <Box width="100%" gap="s" flexDirection="row" justifyContent="center" alignItems="center">
          <Icon labelPosition={labelPosition} label={label} name={icon} color="ink" size={size} />
        </Box>
      </BaseButton>
    </Box>
  );
};
