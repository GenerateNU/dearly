import { ComponentProps, ReactNode } from "react";
import { Box } from "@/design-system/base/box";
import { ViewProps } from "react-native";
import Animated from "react-native-reanimated";
import {
  boxRestyleFunctions,
  createRestyleComponent,
  RestyleFunctionContainer,
} from "@shopify/restyle";
import { Theme } from "./theme";

type BoxProps = ComponentProps<typeof Box>;
type AnimatedViewProps = Partial<ViewProps> & {
  children?: ReactNode;
};
type Props = BoxProps & AnimatedViewProps;

export const AnimatedBox = createRestyleComponent<BoxProps & Omit<Props, keyof BoxProps>, Theme>(
  boxRestyleFunctions as RestyleFunctionContainer<BoxProps, Theme>[],
  Animated.View,
);
