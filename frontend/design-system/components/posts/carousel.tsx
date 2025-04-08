import { useState, useCallback, useRef } from "react";
import { LayoutChangeEvent, TouchableWithoutFeedback, Animated } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { Box } from "@/design-system/base/box";
import { AnimatedBox } from "../../base/animated-box";
import { Heart } from "./heart";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

interface CarouselProps {
  data: string[];
  initialPage?: number;
  like: boolean;
  setLike: () => void;
}

const ImageCarousel: React.FC<CarouselProps> = ({ data, initialPage = 0, like, setLike }) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [showFlyingHeart, setShowFlyingHeart] = useState(false);
  const [lastTap, setLastTap] = useState<number>(0);

  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const animateHeart = useCallback(() => {
    if (!containerWidth) return;

    // Calculate positions
    const startX = containerWidth - 60; // Heart button position
    const startY = containerWidth - 60;
    const centerX = containerWidth / 2 - 20; // Center of carousel
    const centerY = containerWidth / 2 - 20;

    // Reset position
    translateX.setValue(startX);
    translateY.setValue(startY);
    scale.setValue(0.5);
    opacity.setValue(1);
    setShowFlyingHeart(true);

    // Animate everything in parallel, including the fade-out
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: centerX,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: centerY,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFlyingHeart(false);
      translateX.setValue(startX);
      translateY.setValue(startY);
      scale.setValue(0.5);
    });
  }, [containerWidth, translateX, translateY, scale, opacity]);

  const handleLike = useCallback(() => {
    setLike();
    if (!like) {
      animateHeart();
    }
  }, [like, animateHeart, setLike]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!like) {
        setLike();
        animateHeart();
      }
    }
    setLastTap(now);
  }, [lastTap, like, setLike, animateHeart]);

  const animatedStyle = {
    transform: [{ translateX: translateX }, { translateY: translateY }, { scale: scale }],
    opacity: opacity,
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <Box style={{ width: "100%" }}>
        <Image
          className="w-full"
          style={{
            aspectRatio: 1,
            borderRadius: 12,
          }}
          source={{
            uri: item,
          }}
        />
      </Box>
    </TouchableWithoutFeedback>
  );

  return (
    <Box gap="s" width="100%" justifyContent="center">
      <Box onLayout={handleLayout} className="w-full">
        {containerWidth > 0 ? (
          <>
            <Box position="absolute" zIndex={10} right={0} bottom={0} padding="m">
              <Heart onLike={handleLike} like={like} />
            </Box>

            {showFlyingHeart && (
              <AnimatedBox position="absolute" zIndex={100} style={animatedStyle}>
                <Box width={40} height={40} justifyContent="center" alignItems="center">
                  <FontAwesomeIcon icon={faHeart} size={100} />
                </Box>
              </AnimatedBox>
            )}

            <Carousel
              loop={false}
              overscrollEnabled={false}
              height={containerWidth}
              width={containerWidth}
              snapEnabled={true}
              enabled={data.length !== 1}
              defaultIndex={initialPage}
              style={{ position: "relative", borderRadius: 12 }}
              data={data}
              onProgressChange={(_, index) => setPage(Math.round(index))}
              renderItem={renderItem}
            />
          </>
        ) : (
          <Box width="100%" aspectRatio={1} backgroundColor="gray" borderRadius="s" />
        )}
      </Box>
      {containerWidth > 0 && data.length > 1 ? (
        <Box flexDirection="row" width="100%" justifyContent="center" alignItems="center">
          {data.map((_, index) => (
            <Box
              key={index}
              width={8}
              height={8}
              borderRadius="s"
              margin="xs"
              backgroundColor={index === page ? "ink" : "honey"}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default ImageCarousel;
