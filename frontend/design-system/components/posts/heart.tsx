import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { IconButton } from "../ui/icon-button";

interface HeartProps {
  like: boolean;
  onLike: () => void;
  label?: boolean;
  variant: "blush" | "honey";
}

export const Heart: React.FC<HeartProps> = ({ like, onLike, variant, label }) => {
  const theme = useTheme<Theme>();

  const variantStyle = theme.heartVariants[like ? "filled" : "outlined"];

  return (
    <IconButton
      label={label ? "Like" : undefined}
      onPress={onLike}
      icon={variantStyle.icon}
      variant={variant === "blush" ? "blushRounded" : "honeyRounded"}
    />
  );
};
