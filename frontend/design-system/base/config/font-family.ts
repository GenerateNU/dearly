export const getFontConfig = (scaleRatio: number) => {
  const config = {
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
      fontSize: 11 * scaleRatio,
      fontFamily: "ProximaNova-Regular",
    },
  };
  return config;
};

export type FontVariant = keyof ReturnType<typeof getFontConfig> | unknown;
