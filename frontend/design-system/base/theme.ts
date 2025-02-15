import { createTheme } from "@shopify/restyle";
import { faHeart as filledHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as outlinedHeart } from "@fortawesome/free-regular-svg-icons";

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
  darkGray: "#757575",
  gray: "#B0B0B0",
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
  none: 0,
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
  xxl: 1000,
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
      fontSize: 14 * scaleRatio,
      fontFamily: "ProximaNova-Bold",
    },
    defaults: {
      fontSize: 14 * scaleRatio,
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
    heartVariants: heartVariants,
    avatarVariants: avatarVariants,
  });
  return theme;
};

const heartVariants = {
  filled: {
    icon: filledHeart,
    color: COLOR_PALETTE.black,
    size: 30,
    width: 55,
  },
  outlined: {
    icon: outlinedHeart,
    color: COLOR_PALETTE.black,
    size: 30,
    width: 55,
  },
};

const avatarVariants = {
  big: {
    size: 120,
  },
  small: {
    size: 70,
  },
};

type Theme = ReturnType<typeof getTheme>;

export { getTheme, Theme };
