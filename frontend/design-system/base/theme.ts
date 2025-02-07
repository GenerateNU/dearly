import { createTheme } from "@shopify/restyle";

const COLOR_PALETTE = {
  primary: "#FFF5E1",
  secondary: "#4CAF50",
  secondaryLight: "#FFD496",
  secondaryDark: "#FFB347",
  error: "#FF0033",
  success: "#2ECC71",
  warning: "#F39C12",
  black: "#000000",
  white: "#FFFFFF",
};

const ADVANCED_SPACING = {
  xxs: 2,
  xs: 4,
  s: 10,
  m: 20,
  l: 30,
  xl: 40,
  xxl: 50,
  ps: 4,
};

// const BASIC_SPACING = {
//   xxs: 8,
//   xs: 4,
//   s: 16,
//   m: 24,
//   l: 30,
//   xl: 42,
//   xxl: 54,
//   ps: 4,
// };

const BORDER_RADIUS = {
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
};

const getFontConfig = (scaleRatio: number) => {
  const FONT_CONFIG = {
    primary: {
      fontSize: 43 * scaleRatio,
      fontFamily: "ProximaNova-Bold",
    },
    secondary: {
      fontSize: 32 * scaleRatio,
      fontFamily: "ProximaNova-Medium",
    },
    body: {
      fontSize: 16 * scaleRatio,
      fontFamily: "ProximaNova-Bold",
    },
    defaults: {
      fontSize: 16 * scaleRatio,
      fontFamily: "ProximaNova-Regular",
    },
  };
  return FONT_CONFIG;
};

const getTheme = (ratio: number) => {
  const theme = createTheme({
    colors: COLOR_PALETTE,
    spacing: ADVANCED_SPACING,
    borderRadii: BORDER_RADIUS,
    textVariants: getFontConfig(ratio),
  });
  return theme;
};

export { getTheme };
