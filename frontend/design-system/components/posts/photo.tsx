import Box from "@/design-system/base/box";
import { Image } from "react-native";
import { useState, useEffect } from "react";

interface PhotoProps {
  image: string;
}

export const Photo: React.FC<PhotoProps> = ({ image }) => {
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
  );
};
