import { Text } from "@/design-system/base/text";
import { FontVariant } from "@/design-system/base/config/font-family";
import { TouchableOpacity } from "react-native";
import { Icon } from "../icons/icon";
import { useIsBasicMode } from "@/hooks/component/mode";

interface PageButtonProps {
  onPress: () => void;
  label: string;
  textVariant?: FontVariant;
}

export const PageButton: React.FC<PageButtonProps> = ({ onPress, label }) => {
  const isBasic = useIsBasicMode();

  return (
    <TouchableOpacity
      style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}
      onPress={onPress}
    >
      <Text variant="bodyLargeBold">{label}</Text>
      {isBasic && <Icon name="chevron-right" />}
    </TouchableOpacity>
  );
};
