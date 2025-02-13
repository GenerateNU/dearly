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

const BASIC_SPACING = {
  xxs: 8,
  xs: 4,
  s: 16,
  m: 24,
  l: 30,
  xl: 42,
  xxl: 54,
  ps: 4,
  none: 0,
};

const BORDER_RADIUS = {
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
};

const ADVANCED_TEXT = {
  primary: {
    fontSize: 43,
    fontFamily: "ProximaNova-Bold",
  },
  secondary: {
    fontSize: 32,
    fontFamily: "ProximaNova-Medium",
  },
  body: {
    fontSize: 16,
    fontFamily: "ProximaNova-Bold",
  },
  defaults: {
    fontSize: 16,
    fontFamily: "ProximaNova-Regular",
  },
};

const BASIC_TEXT = {
  primary: {
    fontSize: 60,
    fontFamily: "ProximaNova-Bold",
  },
  secondary: {
    fontSize: 40,
    fontFamily: "ProximaNova-Medium",
  },
  body: {
    fontSize: 24,
    fontFamily: "ProximaNova-Bold",
  },
  defaults: {
    fontSize: 24,
    fontFamily: "ProximaNova-Regular",
  },
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

const advancedTheme = createTheme({
  colors: COLOR_PALETTE,
  spacing: ADVANCED_SPACING,
  borderRadii: BORDER_RADIUS,
  textVariants: ADVANCED_TEXT,
  heartIconVariants: heartVariants,
  avatarVariants: avatarVariants,
});

const basicTheme: Theme = {
  ...advancedTheme,
  spacing: BASIC_SPACING,
  textVariants: BASIC_TEXT,
};

export type Theme = typeof advancedTheme;

export { advancedTheme, basicTheme };
