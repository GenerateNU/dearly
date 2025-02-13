import React, { useState } from "react";
import { TouchableOpacity, LayoutChangeEvent } from "react-native";
import Box from "@/design-system/base/box";
import Text from "@/design-system/base/text";

const MenuTab = <T extends string>({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: T;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 justify-center items-center py-2"
    >
      <Text color={isSelected ? "black" : "gray"}>{label}</Text>
    </TouchableOpacity>
  );
};

const HomeMenu = <T extends string>({
  categories,
  selected,
  setSelected,
}: {
  categories: T[];
  selected: T;
  setSelected: (category: T) => void;
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const tabWidth = containerWidth / categories.length;
  const animation = categories.indexOf(selected) === 0 ? 0 : containerWidth / 2;

  return (
    <Box
      onLayout={handleLayout}
      flexDirection="row"
      alignItems="center"
      borderRadius="l"
      borderWidth={1}
      borderColor="black"
      paddingVertical="s"
    >
      <Box
        backgroundColor="darkGray"
        position="absolute"
        justifyContent="center"
        borderRadius="l"
        width={tabWidth * 0.97}
        margin="xxs"
        height="170%"
        style={{
          left: animation,
        }}
      />

      <Box width="100%" flexDirection="row" justifyContent="space-around">
        {categories.map((category) => (
          <MenuTab
            key={category}
            isSelected={selected === category}
            label={category}
            onPress={() => setSelected(category)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HomeMenu;
