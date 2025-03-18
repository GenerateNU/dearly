import { Animated } from "react-native";
import {
  createRestyleComponent,
  backgroundColor,
  layout,
  border,
  spacing,
  opacity,
} from "@shopify/restyle";
import { Theme } from "./theme";
import { AnimationProps } from "@/types/animated";

export const AnimatedBox = createRestyleComponent<AnimationProps, Theme>(
  [backgroundColor, layout, border, spacing, opacity],
  Animated.View,
);
