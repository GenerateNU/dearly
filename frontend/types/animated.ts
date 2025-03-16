import { BoxProps } from "@/design-system/base/box";
import { ReactNode } from "react";

export type AnimationProps = BoxProps & {
  children?: ReactNode;
  entering?: unknown;
  style?: any;
};
