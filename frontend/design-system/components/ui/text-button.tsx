import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { ButtonVariant } from "@/design-system/base/variants/button";
import { FontVariant } from "@/design-system/base/config/font-family";

interface TextButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  variant: ButtonVariant;
  textVariant?: FontVariant;
}

export const TextButton: React.FC<TextButtonProps> = ({
  onPress,
  label,
  disabled = false,
  variant,
  textVariant = "body",
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
      <Text variant={textVariant ? textVariant : "body"} color="ink">
        {label}
      </Text>
    </BaseButton>
  );
};
