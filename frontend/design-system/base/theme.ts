import { createTheme } from "@shopify/restyle";

const palette = {
  purpleLight: "#8C6FF7",
  purplePrimary: "#5A31F4",
  purpleDark: "#3F22AB",

  greenLight: "#56DCBA",
  greenPrimary: "#0ECD9D",
  greenDark: "#0A906E",
  red: "#ff0033",

  black: "#000000",
  white: "#ffffff",
};

const advancedTheme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardPrimaryBackground: palette.purplePrimary,
    error: palette.red,
    black: palette.black,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
    xxl: 60,
  },
  borderRadii: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  textVariants: {
    header: {
      fontWeight: "bold",
      fontSize: 34,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    defaults: {
      fontSize: 16,
      lineHeight: 24,
    },
  },
});

export type Theme = typeof advancedTheme;

const basicTheme: Theme = {
  ...advancedTheme,
  colors: {
    mainBackground: palette.greenLight,
    cardPrimaryBackground: palette.greenDark,
    error: palette.red,
    black: palette.black,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    s: 16,
    m: 32,
    l: 48,
    xl: 80,
    xxl: 120,
  },
  textVariants: {
    header: {
      fontWeight: "bold",
      fontSize: 34,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    defaults: {
      fontSize: 20,
      lineHeight: 40,
    },
  },
};

export { advancedTheme, basicTheme };
