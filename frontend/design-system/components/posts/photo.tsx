import { Box } from "@/design-system/base/box";
import { Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { GestureResponderEvent } from "react-native/Libraries/Types/CoreEventTypes";

interface PhotoProps {
  image: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

export const Photo: React.FC<PhotoProps> = ({ image, onPress }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        await Promise.all([Image.prefetch(image)]);

        const { width, height } = await Image.getSize(image);
        setAspectRatio(width / height);
      } catch (error) {
        console.error("Error preloading images:", error);
        setAspectRatio(1);
      }
    };

    preloadImages();
  }, [image]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box
        width="100%"
        style={{
          aspectRatio: aspectRatio ?? 1,
        }}
      >
        <Image
          style={{
            width: "100%",
            flex: 1,
            borderRadius: 12,
          }}
          className="rounded-lg"
          source={{
            uri: image,
          }}
        />
      </Box>
    </TouchableOpacity>
  );
};
