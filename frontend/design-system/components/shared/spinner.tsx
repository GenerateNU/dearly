import { AnimatedBox } from "@/design-system/base/animated-box";
import { Box } from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";
import { useTheme } from "@shopify/restyle";
import { useEffect, useRef } from "react";
import { Animated, ViewStyle, ColorValue } from "react-native";


interface Props {
  size?:number
  topOffset?:number
}

const Spinner:React.FC<Props> = ({size=30, topOffset=50}) => {
  const animatedValues = useRef(
    Array.from({ length: 12 }).map(() => new Animated.Value(1)),
  ).current;

  const theme = useTheme<Theme>();

  useEffect(() => {
    // Create animations for each dot
    const animations = animatedValues.map((value, index) => {
      return Animated.sequence([
        // Delay based on position
        Animated.delay(index * 100),
        // Loop the pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]);
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  return (
    <Box position="relative" width={100} height={100} alignItems="center" justifyContent="center">
      {Array.from({ length: 12 }).map((_, i) => {
        // Calculate position for each dot based on its index
        const angle = (i / 12) * 2 * Math.PI;
        const radius = size; // Size of the circle
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Animate color transition using scale as an interpolation base
        const backgroundColor = animatedValues[i]!.interpolate({
          inputRange: [1, 2], // base scale range
          outputRange: [theme.colors.gray, theme.colors.honey], // colors transition
        });

        const animatedBackgroundColor = backgroundColor as unknown as ColorValue;

        const animatedStyle = {
          position: "absolute" as "absolute",
          width: size / 6,
          height: size / 6,
          borderRadius: 5,
          backgroundColor: animatedBackgroundColor, // Animated background color
          opacity: 0.5 + i / 12,
          left: 50 + x,
          top: topOffset + y,
          transform: [{ scale: animatedValues[i] }],
        } as ViewStyle;

        return <AnimatedBox key={i} style={animatedStyle} />;
      })}
    </Box>
  );
};

export default Spinner;
