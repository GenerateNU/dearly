import React, { useState } from "react";
import { TouchableOpacity, LayoutChangeEvent } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import Box from "../base/box";
import Text from "../base/text";

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
      <Text color={isSelected ? "white" : "black"}>{label}</Text>
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

  const translateX = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(categories.indexOf(selected) === 0 ? 0 : containerWidth / 2, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    };
  }, [selected, categories]);

  return (
    <Box
      onLayout={handleLayout}
      flexDirection="row"
      width="auto"
      overflow="hidden"
      alignItems="center"
      borderRadius="l"
      borderWidth={1}
      borderColor="black"
      paddingVertical="s"
    >
      <Animated.View style={[translateX]}>
        <Box backgroundColor="black" position="absolute" top={0} bottom={0} borderRadius="l" width={1/2}/>
      </Animated.View>

      {categories.map((category) => (
        <MenuTab
          key={category}
          isSelected={selected === category}
          label={category}
          onPress={() => setSelected(category)}
        />
      ))}
    </Box>
  );
};

export default HomeMenu;
