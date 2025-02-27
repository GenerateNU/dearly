import { useEffect, useRef, useState, useCallback } from "react";
import { Animated } from "react-native";
import Heart from "@/assets/heart.svg";
import { Box } from "@/design-system/base/box";
import LetterD from "@/assets/d.svg";

const ANIMATION_DURATION = 600;
const FINAL_DURATION = 800;

const useAnimatedValue = (initialValue: number) => {
  return useRef(new Animated.Value(initialValue)).current;
};

const SplashScreenAnimation = () => {
  const [animationPhase, setAnimationPhase] = useState("initial");

  const scale = useAnimatedValue(0.05);
  const rotate1 = useAnimatedValue(0);
  const rotate2 = useAnimatedValue(0);
  const rotate3 = useAnimatedValue(0);
  const finalRotate = useAnimatedValue(1);

  const posX1 = useAnimatedValue(0);
  const posX2 = useAnimatedValue(0);
  const posX3 = useAnimatedValue(0);

  const posY1 = useAnimatedValue(0);
  const posY2 = useAnimatedValue(0);
  const posY3 = useAnimatedValue(0);

  const opacity1 = useAnimatedValue(0.5);
  const opacity2 = useAnimatedValue(0.5);
  const opacity3 = useAnimatedValue(0.5);
  const letterDOpacity = useAnimatedValue(0);

  const heart2FinalScale = useAnimatedValue(1);
  const heartShrinkScale = useAnimatedValue(1);
  const letterDScale = useAnimatedValue(1.2);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = useCallback(() => {
    setAnimationPhase("growing");

    // Phase 1: Grow and initial rotation
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true }),
      Animated.timing(opacity1, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity2, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity3, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(rotate1, {
        toValue: 0.5,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(rotate2, {
        toValue: 0.5,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(rotate3, {
        toValue: 0.5,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationPhase("transitioning");

      // Phase 2: Align hearts vertically
      Animated.parallel([
        Animated.timing(posX1, {
          toValue: 170,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(posX2, {
          toValue: -10,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(posX3, {
          toValue: -140,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),

        Animated.timing(posY1, {
          toValue: -40,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(posY2, {
          toValue: 30,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(posY3, {
          toValue: 30,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),

        Animated.timing(rotate1, {
          toValue: 1,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(rotate2, {
          toValue: 1,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(rotate3, {
          toValue: 1,
          delay: 200,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationPhase("aligned");

        // Phase 3: Combine hearts into middle heart
        setTimeout(() => {
          setAnimationPhase("combining");

          Animated.parallel([
            Animated.timing(posY1, {
              toValue: 40,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(posY3, {
              toValue: -40,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(posX1, {
              toValue: 110,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(posX3, {
              toValue: -50,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),

            Animated.timing(opacity1, {
              toValue: 0,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(opacity3, {
              toValue: 0,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),

            Animated.timing(heart2FinalScale, {
              toValue: 1.3,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setAnimationPhase("combined");

            // Phase 4: Final animation (rotate, shrink, fade in D)
            Animated.parallel([
              Animated.timing(posY2, {
                toValue: 130,
                duration: FINAL_DURATION,
                useNativeDriver: true,
              }),
              Animated.timing(posX2, {
                toValue: -20,
                duration: FINAL_DURATION,
                useNativeDriver: true,
              }),
              Animated.timing(finalRotate, {
                toValue: 0,
                duration: FINAL_DURATION,
                useNativeDriver: true,
              }),

              Animated.timing(letterDOpacity, {
                delay: 400,
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(letterDScale, {
                toValue: 1,
                delay: 400,
                duration: 400,
                useNativeDriver: true,
              }),

              Animated.timing(heartShrinkScale, {
                toValue: 0.35,
                duration: FINAL_DURATION,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setAnimationPhase("completed");
            });
          });
        }, 500);
      });
    });
  }, []);

  // Interpolation for rotation degrees
  const rotate1Deg = rotate1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-89deg", "-55deg", "-45deg"],
  });

  const rotate2Deg = rotate2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "-60deg", "-45deg"],
  });

  const rotate3Deg = rotate3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-80deg", "-30deg", "-45deg"],
  });

  const finalRotateDeg = finalRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
  });

  return (
    <Box
      className="mt-[-20%]"
      backgroundColor="pearl"
      width="100%"
      flex={1}
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        gap="s"
        justifyContent="center"
        flexDirection="row"
        alignItems="center"
        width="100%"
      >
        <Animated.View
          style={{
            marginTop: 130,
            opacity: opacity1,
            transform: [
              { scale },
              { rotate: rotate1Deg },
              { translateX: posX1 },
              { translateY: posY1 },
            ],
          }}
        >
          <Heart height={50} width={50} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: opacity2,
            zIndex: 1,
            transform: [
              { scale },
              { rotate: animationPhase === "combined" ? finalRotateDeg : rotate2Deg },
              { scale: heart2FinalScale },
              { scale: heartShrinkScale },
              { translateX: posX2 },
              { translateY: posY2 },
            ],
          }}
        >
          <Heart height={90} width={90} />
        </Animated.View>

        <Animated.View
          style={{
            marginTop: 80,
            opacity: opacity3,
            transform: [
              { scale },
              { rotate: rotate3Deg },
              { translateX: posX3 },
              { translateY: posY3 },
            ],
          }}
        >
          <Heart height={70} width={70} />
        </Animated.View>
      </Box>

      <Animated.View style={{ opacity: letterDOpacity, transform: [{ scale: letterDScale }] }}>
        <LetterD width={210} />
      </Animated.View>
    </Box>
  );
};

export default SplashScreenAnimation;
