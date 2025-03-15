import { useState, useRef, useEffect } from "react";
import { TouchableOpacity, LayoutChangeEvent, Animated, Easing } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";

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
  const translateX = useRef(new Animated.Value(0)).current;
  const theme = useTheme<Theme>();
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const tabWidth = (containerWidth / categories.length) * 0.97;

  useEffect(() => {
    const selectedIndex = categories.indexOf(selected);
    Animated.timing(translateX, {
      toValue: selectedIndex * tabWidth,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selected, categories, tabWidth, containerWidth, translateX]);

  return (
    <Box
      onLayout={handleLayout}
      flexDirection="row"
      alignItems="center"
      borderRadius="full"
      paddingVertical="s"
      borderWidth={2}
      borderColor="darkGray"
    >
      <AnimatedBox
        style={[
          {
            backgroundColor: theme.colors.honey,
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: theme.borderRadii.full,
            width: tabWidth,
            height: "150%",
            left: 3,
            right: 3,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 0,
            transform: [{ translateX }],
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
