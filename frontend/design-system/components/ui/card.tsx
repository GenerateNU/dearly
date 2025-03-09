import { Box } from "@/design-system/base/box";
import React from "react";
import { Text } from "@/design-system/base/text";
import { Pressable } from "react-native";

interface CardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelected: () => void;
}

export const Card: React.FC<CardProps> = ({ title, description, selected, onSelected }) => {
  return (
    <Pressable onPress={onSelected}>
      <Box
        borderColor="ink"
        gap="s"
        borderWidth={selected ? 2 : 1}
        padding="m"
        borderRadius="s"
        alignContent="flex-start"
        justifyContent="flex-start"
        flexDirection="column"
      >
        <Text variant="captionBold">{title}</Text>
        <Text variant="caption">{description}</Text>
      </Box>
    </Pressable>
  );
};
