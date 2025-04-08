const FONT_SIZES = {
  xsmall: 12,
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 32,
};

const FONT_FAMILIES = {
  regular: "Regular",
  bold: "Bold",
};

export const getFontConfig = (scaleRatio: number = 1) => {
  return {
    h1: {
      fontSize: FONT_SIZES.xxlarge * scaleRatio,
      fontFamily: FONT_FAMILIES.bold,
    },
    h2: {
      fontSize: FONT_SIZES.xlarge * scaleRatio,
      fontFamily: FONT_FAMILIES.bold,
    },
    bodyLarge: {
      fontSize: FONT_SIZES.large * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
    bodyLargeBold: {
      fontSize: FONT_SIZES.large * scaleRatio,
      fontFamily: FONT_FAMILIES.bold,
    },
    body: {
      fontSize: FONT_SIZES.medium * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
    bodyBold: {
      fontSize: FONT_SIZES.medium * scaleRatio,
      fontFamily: FONT_FAMILIES.bold,
    },
    button: {
      fontSize: FONT_SIZES.large * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
    caption: {
      fontSize: FONT_SIZES.small * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
    captionBold: {
      fontSize: FONT_SIZES.small * scaleRatio,
      fontFamily: FONT_FAMILIES.bold,
    },
    navbar: {
      fontSize: FONT_SIZES.xsmall * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
    defaults: {
      fontSize: FONT_SIZES.medium * scaleRatio,
      fontFamily: FONT_FAMILIES.regular,
    },
  };
};

export type FontVariant = Exclude<keyof ReturnType<typeof getFontConfig>, "defaults">;

export const applyFont = (variant: FontVariant, scaleRatio: number = 1) => {
  const config = getFontConfig(scaleRatio);
  return config[variant];
};
