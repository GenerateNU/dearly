import { createTheme } from "@shopify/restyle";
import { Spacing } from "./config/spacing";
import { BorderRadius } from "./config/border-radius";
import { getFontConfig } from "./config/font-family";
import { heartVariants } from "./variants/heart";
import { avatarVariants } from "./variants/avatar";
import { buttonVariants } from "./variants/button";
import { ColorPalette } from "./config/color";

const getTheme = (ratio: number) => {
  const theme = createTheme({
    colors: ColorPalette,
    spacing: Spacing,
    borderRadii: BorderRadius,
    textVariants: getFontConfig(ratio),
    heartVariants: heartVariants,
    avatarVariants: avatarVariants,
    buttonVariants: buttonVariants,
  });
  return theme;
};

type Theme = ReturnType<typeof getTheme>;

export { getTheme, Theme };
