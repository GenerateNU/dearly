export const getFontConfig = (scaleRatio: number) => {
  const config = {
    h1: {
      fontSize: 28 * scaleRatio,
      fontFamily: "Bold",
    },
    h2: {
      fontSize: 22 * scaleRatio,
      fontFamily: "Bold",
    },
    bodyLargeBold: {
      fontSize: 16 * scaleRatio,
      fontFamily: "Bold",
    },
    bodyLarge: {
      fontSize: 16 * scaleRatio,
      fontFamily: "Regular",
    },
    button: {
      fontSize: 16 * scaleRatio,
      fontFamily: "Regular",
    },
    body: {
      fontSize: 14 * scaleRatio,
      fontFamily: "Regular",
    },
    caption: {
      fontSize: 11 * scaleRatio,
      fontFamily: "Regular",
    },
    captionBold: {
      fontSize: 11 * scaleRatio,
      fontFamily: "Bold",
    },
    defaults: {
      fontSize: 14 * scaleRatio,
      fontFamily: "Regular",
    },
    navbar: {
      fontSize: 9 * scaleRatio,
      fontFamily: "Regular",
    },
  };
  return config;
};

export type FontVariant = Exclude<keyof ReturnType<typeof getFontConfig>, "defaults">;
