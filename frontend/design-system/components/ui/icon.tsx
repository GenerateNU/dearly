import { Box } from "@/design-system/base/box";
import { MaterialIcon } from "@/types/icon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text } from "@/design-system/base/text";
import { ResponsiveValue, useTheme } from "@shopify/restyle";
import { ColorName, ColorPalette } from "@/design-system/base/config/color";
import { Theme } from "@/design-system/base/theme";

interface IconProps {
  name: MaterialIcon;
  color?: ColorName;
  labelPosition?: "left" | "right" | "bottom" | "top";
  label?: string;
  navbar?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  color = "ink",
  labelPosition,
  label,
  navbar,
}) => {
  const positionStyles: Record<
    string,
    ResponsiveValue<"row" | "row-reverse" | "column" | "column-reverse", undefined>
  > = {
    left: "row",
    right: "row-reverse",
    top: "column-reverse",
    bottom: "column",
  };

  const { iconSize } = useTheme<Theme>();

  return (
    <Box
      justifyContent="center"
      alignItems="center"
      gap="xs"
      flexDirection={positionStyles[labelPosition || "left"]}
    >
      <MaterialCommunityIcons name={name} color={ColorPalette[color]} size={iconSize} />
      {label && (
        <Text color={color} variant={navbar ? "navbar" : "body"}>
          {label}
        </Text>
      )}
    </Box>
  );
};
