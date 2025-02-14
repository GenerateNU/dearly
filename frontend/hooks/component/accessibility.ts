import { useEffect, useState } from "react";
import { AppState, PixelRatio } from "react-native";

export const useAccessibility = () => {
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        setFontScale(PixelRatio.getFontScale());
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return fontScale;
};
