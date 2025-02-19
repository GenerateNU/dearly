import { Box } from "@/design-system/base/box";
import { MaterialIcon } from "@/types/icon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text } from "@/design-system/base/text";
import { ResponsiveValue } from "@shopify/restyle";
import { ColorName, ColorPalette } from "@/design-system/base/config/color";

interface IconProps {
  name: MaterialIcon;
  color: ColorName;
  size: number;
  labelPosition?: "left" | "right" | "bottom" | "top";
  label?: string;
  navbar?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, color, size, labelPosition, label, navbar }) => {
  const positionStyles: Record<
    string,
    ResponsiveValue<"row" | "row-reverse" | "column" | "column-reverse", undefined>
  > = {
    left: "row",
    right: "row-reverse",
    top: "column-reverse",
    bottom: "column",
  };

  return (
    <Box
      width="100%"
      justifyContent="center"
      alignItems="center"
      gap="xs"
      flexDirection={positionStyles[labelPosition || "right"]}
    >
      <MaterialCommunityIcons name={name} color={ColorPalette[color]} size={size} />
      {label && (
        <Text color={color} variant={navbar ? "navbar" : "button"}>
          {label}
        </Text>
      )}
    </Box>
  );
};
