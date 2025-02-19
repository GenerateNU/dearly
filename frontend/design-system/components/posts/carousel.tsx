import { useState, useCallback } from "react";
import { LayoutChangeEvent } from "react-native";
import {
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
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
}

const ImageCarousel: React.FC<CarouselProps> = ({ data, initialPage = 0, like }) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLiking, setLike] = useState<boolean>(like);
  const [page, setPage] = useState<number>(0);
  const [showFlyingHeart, setShowFlyingHeart] = useState(false);
  const scrollOffsetValue = useSharedValue<number>(0);

  // Animation values
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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
    translateX.value = startX;
    translateY.value = startY;
    scale.value = 0.5;
    opacity.value = 1;
    setShowFlyingHeart(true);

    // Animate to center
    translateX.value = withSequence(
      withSpring(centerX, { damping: 15 }),
      withTiming(startX, { duration: 0 }),
    );
    translateY.value = withSequence(
      withSpring(centerY, { damping: 15 }),
      withTiming(startY, { duration: 0 }),
    );
    scale.value = withSequence(withSpring(1.2, { damping: 15 }), withTiming(0.5, { duration: 0 }));
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 200 }, () => {
        runOnJS(setShowFlyingHeart)(false);
      }),
    );
  }, [containerWidth]);

  const handleLike = useCallback(() => {
    setLike(!isLiking);
    if (!isLiking) {
      animateHeart();
    }
  }, [isLiking, animateHeart]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const renderItem = ({ item }: { item: string }) => (
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
  );

  return (
    <Box width="100%" justifyContent="center">
      <Box onLayout={handleLayout} className="w-full">
        {containerWidth > 0 && (
          <>
            <Box position="absolute" zIndex={10} right={0} bottom={0} padding="m">
              <Heart variant="iconHoney" onLike={handleLike} like={isLiking} />
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
              defaultScrollOffsetValue={scrollOffsetValue}
              renderItem={renderItem}
            />

            <Box
              position="absolute"
              flexDirection="row"
              width="100%"
              bottom="4%"
              justifyContent="center"
              alignItems="center"
            >
              {data.map((_, index) => (
                <Box
                  key={index}
                  width={8}
                  height={8}
                  borderRadius="s"
                  margin="xs"
                  backgroundColor={index === page ? "darkGray" : "gray"}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ImageCarousel;
