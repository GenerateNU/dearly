import { ComponentProps, ReactNode } from "react";
import { Box } from "@/design-system/base/box";
import Animated from "react-native-reanimated";
import {
  createRestyleComponent,
  backgroundColor,
  layout,
  border,
  spacing,
  opacity,
} from "@shopify/restyle";
import { Theme } from "./theme";

type BoxProps = ComponentProps<typeof Box>;

type AnimatedBoxProps = BoxProps & {
  children?: ReactNode;
  entering?: unknown;
};

export const AnimatedBox = createRestyleComponent<AnimatedBoxProps, Theme>(
  [backgroundColor, layout, border, spacing],
  Animated.View,
);
