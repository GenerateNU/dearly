import { Text } from "@/design-system/base/text";
import { FontVariant } from "@/design-system/base/config/font-family";
import { ColorName } from "@/design-system/base/config/color";
import { TouchableOpacity } from "react-native";
import { Box } from "@/design-system/base/box";
import { Icon } from "../icons/icon";

interface PageButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  textVariant?: FontVariant;
  colorVariant?: ColorName;
}

export const PageButton: React.FC<PageButtonProps> = ({
  onPress,
  label,
  disabled = false,
  textVariant = "h1",
  colorVariant = "ink",
}) => {
  return (
    <Box height={70} flexDirection="row" paddingHorizontal="s">
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        onPress={onPress}
      >
        <Text variant={textVariant}>{label}</Text>
        <Box position="absolute" right={5}>
          <Icon name="chevron-right"></Icon>
        </Box>
      </TouchableOpacity>
    </Box>
  );
};
