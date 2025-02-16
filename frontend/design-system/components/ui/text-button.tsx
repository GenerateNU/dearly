import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { ButtonVariant } from "@/design-system/base/variants/button";

interface TextButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  variant: ButtonVariant;
}

export const TextButton: React.FC<TextButtonProps> = ({
  onPress,
  label,
  disabled = false,
  variant,
}) => {
  return (
    <BaseButton
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      activeOpacity={0.5}
      disabled={disabled}
      variant={variant}
      onPress={onPress}
    >
      <Text variant="body" color="ink">
        {label}
      </Text>
    </BaseButton>
  );
};
