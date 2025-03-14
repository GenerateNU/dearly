import { useState } from "react";
import { TouchableOpacity, LayoutChangeEvent } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

const MenuTab = <T extends string>({
  isSelected,
  label,
  onPress,
  width,
}: {
  isSelected: boolean;
  label: T;
  onPress: () => void;
  width: number;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box width={width} justifyContent="center" alignItems="center" paddingVertical="xxs">
        <Text variant="body" color={isSelected ? "ink" : "gray"}>
          {label}
        </Text>
      </Box>
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

  const tabWidth = (containerWidth / categories.length) * 0.999;

  const translateX = useAnimatedStyle(() => {
    const selectedIndex = categories.indexOf(selected);
    return {
      transform: [
        {
          translateX: withTiming(selectedIndex * tabWidth, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    };
  }, [selected, categories, tabWidth, containerWidth]);

  return (
    <Box
      onLayout={handleLayout}
      flexDirection="row"
      alignItems="center"
      borderRadius="full"
      paddingVertical="s"
      borderWidth={1}
      borderColor="darkGray"
    >
      <AnimatedBox
        backgroundColor="honey"
        position="absolute"
        justifyContent="center"
        alignItems="center"
        borderRadius="xl"
        width={tabWidth}
        height="160%"
        style={[
          translateX,
          {
            shadowColor: "black",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 0,
            borderWidth: 2,
            borderColor: "rgba(255, 243, 243, 0.48)",
          },
        ]}
      />

      <Box width="100%" flexDirection="row">
        {categories.map((category) => (
          <MenuTab
            key={category}
            isSelected={selected === category}
            label={category}
            onPress={() => setSelected(category)}
            width={tabWidth}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HomeMenu;
