import {
  ColorProps,
  createRestyleComponent,
  createVariant,
  spacing,
  SpacingProps,
  VariantProps,
} from "@shopify/restyle";
import { Theme } from "./theme";
import { TouchableOpacity } from "react-native";

export const BaseButton = createRestyleComponent<
  VariantProps<Theme, "buttonVariants"> &
    SpacingProps<Theme> &
    ColorProps<Theme> &
    React.ComponentProps<typeof TouchableOpacity>,
  Theme
>([createVariant({ themeKey: "buttonVariants" }), spacing], ({ disabled, style, ...props }) => (
  <TouchableOpacity disabled={disabled} style={[style, disabled && { opacity: 0.5 }]} {...props} />
));
