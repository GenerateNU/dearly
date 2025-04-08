import { TouchableOpacity } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flex: 1 }}>
      <Box
        justifyContent="center"
        alignItems="center"
        paddingVertical="s"
        backgroundColor={isSelected ? "honey" : undefined}
        borderRadius="full"
      >
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
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      borderRadius="full"
      borderWidth={2}
      borderColor="darkGray"
      width="100%"
    >
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
