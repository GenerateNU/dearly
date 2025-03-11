import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { IconButton } from "../ui/buttons/icon-button";
import { useIsBasicMode } from "@/hooks/component/mode";

interface HeartProps {
  like: boolean;
  onLike: () => void;
  variant: "blush" | "honey";
}

export const Heart: React.FC<HeartProps> = ({ like, onLike, variant }) => {
  const theme = useTheme<Theme>();
  const isBasic = useIsBasicMode();

  const variantStyle = theme.heartVariants[like ? "filled" : "outlined"];

  return (
    <IconButton
      label={isBasic ? "Like" : undefined}
      onPress={onLike}
      icon={variantStyle.icon}
      variant={variant === "blush" ? "blushRounded" : "honeyRounded"}
    />
  );
};
