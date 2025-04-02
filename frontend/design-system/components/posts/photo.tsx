import { Box } from "@/design-system/base/box";
import { Image, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { GestureResponderEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";

interface PhotoProps {
  image: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

export const Photo: React.FC<PhotoProps> = ({ image, onPress }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);

    const loadImageDetails = async () => {
      try {
        Image.prefetch(image).catch(() => {});
        Image.getSize(
          image,
          (width, height) => {
            const ratio = width / height;
            setAspectRatio(ratio);
          },
          () => {
            setAspectRatio(1);
          },
        );
      } catch (error) {
        console.error("Error loading image details:", error);
        setAspectRatio(1);
      }
    };

    loadImageDetails();
  }, [image]);

  const handleImageLoad = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const theme = useTheme<Theme>();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box
        width="100%"
        aspectRatio={aspectRatio ?? 1}
        borderRadius="s"
        overflow="hidden"
        backgroundColor="gray"
        style={{
          backgroundColor: "#f0f0f0",
        }}
      >
        {aspectRatio && (
          <AnimatedBox style={{ flex: 1, opacity: fadeAnim }}>
            <Image
              style={{
                width: "100%",
                height: "100%",
                borderRadius: theme.borderRadii.s,
              }}
              source={{ uri: image }}
              onLoad={handleImageLoad}
              resizeMode="cover"
            />
          </AnimatedBox>
        )}
      </Box>
    </TouchableOpacity>
  );
};
