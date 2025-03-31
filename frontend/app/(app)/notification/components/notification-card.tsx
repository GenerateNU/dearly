import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Theme } from "@/design-system/base/theme";
import { Avatar } from "@/design-system/components/shared/avatar";
import { Notification } from "@/types/user";
import { categorizeTime } from "@/utilities/time";
import { useTheme } from "@shopify/restyle";
import { Image } from "react-native";

const NotificationCard: React.FC<Notification> = ({
  id,
  profilePhoto,
  mediaURL,
  actorId,
  postId,
  description,
  createdAt,
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box gap="s" flexDirection="row" justifyContent="center" alignContent="center">
      <Avatar variant="small" profilePhoto={profilePhoto ?? DEFAULT_PROFILE_PHOTO} />
      <Box width="55%">
        <Text ellipsizeMode="tail" variant="caption">
          <Text variant="captionBold">{description!.split(" ")[0]}</Text>{" "}
          <Text variant="caption">
            {description?.split(" ").slice(1, description?.split(" ").length).join(" ")}
          </Text>{" "}
          <Text variant="caption" color="slate">
            {categorizeTime(new Date(createdAt).toISOString())}
          </Text>
        </Text>
      </Box>
      <Image
        style={{
          aspectRatio: 1,
          width: theme.avatarVariants.small.size,
          borderRadius: theme.borderRadii.m,
        }}
        source={{
          uri: mediaURL,
        }}
      />
    </Box>
  );
};

export default NotificationCard;
