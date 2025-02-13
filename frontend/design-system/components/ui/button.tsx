import { TouchableOpacity } from "react-native";
import {
  useRestyle,
  spacing,
  border,
  backgroundColor,
  SpacingProps,
  BorderProps,
  BackgroundColorProps,
  composeRestyleFunctions,
} from "@shopify/restyle";
import Text from "@/design-system/base/text";
import Box from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";

type RestyleProps = SpacingProps<Theme> & BorderProps<Theme> & BackgroundColorProps<Theme>;

const restyleFunctions = composeRestyleFunctions<Theme, RestyleProps>([
  spacing,
  border,
  backgroundColor,
]);

type Props = RestyleProps & {
  onPress: () => void;
  label: string;
  disabled?: boolean;
};

const BaseButton = ({ onPress, label, disabled = false, ...rest }: Props) => {
  const props = useRestyle(restyleFunctions, rest);

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <Box
        opacity={disabled ? 0.5 : 1}
        borderRadius="s"
        backgroundColor="secondaryDark"
        padding="s"
        borderColor="secondaryDark"
        borderWidth={1}
        {...props}
      >
        <Text variant="body" color="black">
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

export default BaseButton;
