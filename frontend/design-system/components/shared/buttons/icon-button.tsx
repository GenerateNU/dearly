import { BaseButton } from "@/design-system/base/button";
import { MaterialIcon } from "@/types/icon";
import { Icon } from "../icons/icon";
import { ButtonVariant } from "@/design-system/base/variants/button";

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: MaterialIcon;
  variant: ButtonVariant;
  label?: string;
  labelPosition?: "left" | "right" | "bottom" | "top";
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  disabled = false,
  variant,
  label,
  labelPosition,
}) => {
  return (
    <BaseButton activeOpacity={1} disabled={disabled} variant={variant} onPress={onPress}>
      <Icon labelPosition={labelPosition} label={label} name={icon} color="ink" />
    </BaseButton>
  );
};
