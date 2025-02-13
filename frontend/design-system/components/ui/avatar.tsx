import Box from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";

interface AvatarProps {
  profilePhoto: string;
  variant?: "small" | "big";
}

// TODO: figure out how to create variants of a component
export const Avatar: React.FC<AvatarProps> = ({ profilePhoto, variant = "small" }) => {
  const theme = useTheme<Theme>();
  const variantStyle = theme.avatarVariants[variant];

  return (
    <Box width={variantStyle.size}>
      <Image
        className="w-full"
        style={{
          aspectRatio: 1,
          borderRadius: "100%",
        }}
        source={{
          uri: profilePhoto,
        }}
      />
    </Box>
  );
};
