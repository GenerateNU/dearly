import { Box } from "@/design-system/base/box";
import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Text } from "@/design-system/base/text";

interface SelectItemProps<T> {
  selected: T;
  setSelected: (value: T) => void;
  data: T[];
  renderLabel: (item: T) => string;
}

export const SelectItem = <T extends object>({
  selected,
  setSelected,
  data,
  renderLabel,
}: SelectItemProps<T>) => {
  const isEqual = (a: T, b: T) => {
    return a && b && (a as any).id === (b as any).id;
  };

  const renderItem = ({ item }: { item: T }) => {
    const isSelected = isEqual(selected!, item);

    return (
      <TouchableOpacity onPress={() => setSelected(item)} activeOpacity={0.7}>
        <Box
          paddingVertical="s"
          justifyContent="space-between"
          flexDirection="row"
          alignItems="center"
        >
          <Box width="80%">
            <Text color={isSelected ? "ink" : "slate"} variant="bodyLargeBold">
              {renderLabel(item)}
            </Text>
          </Box>
          <Box
            borderRadius="full"
            borderColor="ink"
            borderWidth={2}
            width={24}
            height={24}
            alignItems="center"
            justifyContent="center"
          >
            {isSelected && <Box width={12} height={12} backgroundColor="ink" borderRadius="full" />}
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <Box width="100%">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => (item as any).id?.toString() || Math.random().toString()}
        scrollEnabled={data.length > 5}
      />
    </Box>
  );
};
