import Box from "@/design-system/base/box";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { Pressable } from "react-native";

interface HeartProps {
  like: boolean;
  onLike: () => void;
}

export const Heart: React.FC<HeartProps> = ({ like, onLike }) => {
  const theme = useTheme<Theme>();

  const variantStyle = theme.heartVariants[like ? "filled" : "outlined"];

  return (
    <Pressable onPress={onLike}>
      <Box
        borderRadius="xl"
        alignItems="center"
        padding="s"
        width={variantStyle.width}
        aspectRatio={1}
        justifyContent="center"
        backgroundColor="secondaryDark"
      >
        <FontAwesomeIcon
          icon={variantStyle.icon}
          color={variantStyle.color}
          size={variantStyle.size}
        />
      </Box>
    </Pressable>
  );
};
