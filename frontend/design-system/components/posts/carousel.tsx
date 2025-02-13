import { useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import Box from "../../base/box";
import { Heart } from "./heart";

interface CarouselProps {
  data: string[];
  initialPage?: number;
}

const ImageCarousel: React.FC<CarouselProps> = ({ data, initialPage = 0 }) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
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

  return (
    <Box width="100%" justifyContent="center">
      <Box onLayout={handleLayout} className="w-full">
        {containerWidth > 0 && (
          <>
            <Box position="absolute" zIndex={10} right={0} bottom={0} padding="m">
              <Heart like={true} />
            </Box>

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
