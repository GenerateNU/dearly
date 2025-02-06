import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const usePulsingAnimation = (initialValue: number = 1, duration: number = 1000) => {
  const opacity = useRef(new Animated.Value(initialValue)).current;

  const startPulsing = () => {
    opacity.setValue(initialValue);
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: initialValue,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    startPulsing();
  });

  return opacity;
};

export default usePulsingAnimation;
