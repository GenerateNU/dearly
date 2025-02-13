import { ComponentProps, ReactNode } from "react";
import Box from "./box";
import { AnimatedProps } from "react-native-reanimated";
import { Animated, ViewProps } from "react-native";
import {
  boxRestyleFunctions,
  createRestyleComponent,
  RestyleFunctionContainer,
} from "@shopify/restyle";
import { Theme } from "./theme";

type BoxProps = ComponentProps<typeof Box>;
type AnimatedViewProps = AnimatedProps<ViewProps & { children?: ReactNode }>;
type Props = BoxProps & AnimatedViewProps;

export const AnimatedBox = createRestyleComponent<BoxProps & Omit<Props, keyof BoxProps>, Theme>(
  boxRestyleFunctions as RestyleFunctionContainer<BoxProps, Theme>[],
  Animated.View,
);
