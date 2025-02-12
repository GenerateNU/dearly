import { useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import Box from "../base/box";

interface CarouselProps {
  data: string[];
  initialPage?: number;
}

const ImageCarousel: React.FC<CarouselProps> = ({ data, initialPage = 0 }) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const scrollOffsetValue = useSharedValue<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

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

  // TODO: add like component

  return (
    <Box onLayout={handleLayout} className="w-full">
      {containerWidth > 0 && (
        <>
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
            defaultScrollOffsetValue={scrollOffsetValue}
            renderItem={renderItem}
          />
        </>
      )}
    </Box>
  );
};

export default ImageCarousel;
