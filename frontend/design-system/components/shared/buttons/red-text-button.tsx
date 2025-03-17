import { Box } from "@/design-system/base/box";
import { Icon } from "../icons/icon";
import { MaterialIcon } from "@/types/icon";
import { Text } from "@/design-system/base/text";
import { TouchableOpacity } from "react-native";

interface RedTextButtonProps {
  onPress: () => void;
  label: string;
  icon: MaterialIcon;
}

const RedTextButton: React.FC<RedTextButtonProps> = ({ onPress, label, icon }) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Box alignItems="center" flexDirection="row" gap="xs">
        <Text color="error" variant="bodyLargeBold">
          {label}
        </Text>
        <Icon color="error" name={icon} />
      </Box>
    </TouchableOpacity>
  );
};

export default RedTextButton;
