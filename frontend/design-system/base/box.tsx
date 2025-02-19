import { createBox } from "@shopify/restyle";
import { Theme } from "./theme";

export const Box = createBox<Theme>();

export type BoxProps = React.ComponentProps<typeof Box>;
