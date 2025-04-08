import { Box } from "@/design-system/base/box";
import { Pressable } from "react-native";
import { Icon } from "./icon";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { useIsBasicMode } from "@/hooks/component/mode";

interface BackIconProps {
  onPress?: () => void;
  text?: string;
}

export const BackIcon: React.FC<BackIconProps> = ({ onPress, text }) => {
  const basic = useIsBasicMode();
  return (
    <Pressable onPress={onPress ? onPress : () => router.back()}>
      <Box alignItems="center" flexDirection="row" gap="xs">
        <Icon name="arrow-left-circle-outline" />
        {basic && <Text variant="captionBold">{text ? text : "Back"}</Text>}
      </Box>
    </Pressable>
  );
};
