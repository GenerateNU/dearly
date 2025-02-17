import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { IconButton } from "../ui/icon-button";

interface HeartProps {
  like: boolean;
  onLike: () => void;
  label?: boolean;
  variant: "iconHoney" | "iconBlush" | "oneThirdHoneyRounded" | "oneThirdBlushRounded";
}

export const Heart: React.FC<HeartProps> = ({ like, onLike, variant, label }) => {
  const theme = useTheme<Theme>();
  const textLabel = !label ? "" : "Like";

  const variantStyle = theme.heartVariants[like ? "filled" : "outlined"];

  return (
    <IconButton
      onPress={onLike}
      icon={variantStyle.icon}
      variant={variant}
      size={variantStyle.size}
      label={textLabel}
    />
  );
};
