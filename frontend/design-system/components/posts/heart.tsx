import Box from "@/design-system/base/box";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { useState } from "react";
import { Pressable } from "react-native";

interface HeartProps {
  like: boolean;
}

export const Heart: React.FC<HeartProps> = ({ like }) => {
  const [initialState, setState] = useState<boolean>(like);
  const theme = useTheme<Theme>();

  const variantStyle = theme.heartIconVariants[initialState ? "filled" : "outlined"];

  return (
    <Pressable onPress={() => setState(!initialState)}>
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
