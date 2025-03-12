import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { useIsBasicMode } from "@/hooks/component/mode";
import { IconButton } from "../shared/buttons/icon-button";

interface HeartProps {
  like: boolean;
  onLike: () => void;
}

export const Heart: React.FC<HeartProps> = ({ like, onLike }) => {
  const theme = useTheme<Theme>();
  const isBasic = useIsBasicMode();

  const variantStyle = theme.heartVariants[like ? "filled" : "outlined"];

  return (
    <IconButton
      label={isBasic ? "Like" : undefined}
      onPress={onLike}
      variant="icon"
      icon={variantStyle.icon}
    />
  );
};
