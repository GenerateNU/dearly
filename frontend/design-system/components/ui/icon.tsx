import { Box } from "@/design-system/base/box";
import { MaterialIcon } from "@/types/icon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text } from "@/design-system/base/text";
import { ResponsiveValue } from "@shopify/restyle";

interface IconProps {
  name: MaterialIcon;
  color: string;
  size: number;
  labelPosition?: "left" | "right" | "bottom" | "top";
  label?: string;
}

export const Icon: React.FC<IconProps> = ({ name, color, size, labelPosition, label }) => {
  const positionStyles: Record<
    string,
    ResponsiveValue<"row" | "row-reverse" | "column" | "column-reverse", undefined>
  > = {
    left: "row",
    right: "row-reverse",
    top: "column",
    bottom: "column-reverse",
  };

  return (
    <Box
      justifyContent="center"
      alignItems="center"
      flexDirection={positionStyles[labelPosition || "right"]}
    >
      <MaterialCommunityIcons name={name} color={color} size={size} />
      {label && <Text>{label}</Text>}
    </Box>
  );
};
