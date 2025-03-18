import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Box } from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";

interface AvatarProps {
  profilePhoto: string | null;
  variant: "small" | "medium" | "big" | "huge";
}

export const Avatar: React.FC<AvatarProps> = ({ profilePhoto, variant = "small" }) => {
  const theme = useTheme<Theme>();
  const variantStyle = theme.avatarVariants[variant];
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  return (
    <Box aspectRatio={1} width={variantStyle.size}>
      <Image
        className="w-full"
        style={{
          aspectRatio: 1,
          borderRadius: "100%",
        }}
        source={{
          uri: profile,
        }}
      />
    </Box>
  );
};
