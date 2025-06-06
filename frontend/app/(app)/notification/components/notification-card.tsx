import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { useRemoveMemberContext } from "@/contexts/remove-member";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Theme } from "@/design-system/base/theme";
import { Avatar } from "@/design-system/components/shared/avatar";
import { Notification } from "@/types/user";
import { categorizeTime } from "@/utilities/time";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Image } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const NotificationCard: React.FC<Notification> = ({
  profilePhoto,
  mediaURL,
  actorId,
  postId,
  description,
  createdAt,
}) => {
  const theme = useTheme<Theme>();
  const { setUser } = useRemoveMemberContext();

  const removeMemberPressed = () => {
    setUser({
      id: actorId,
      username: description!.split(" ")[0],
    });
    router.push(`/(app)/user/${actorId}`);
  };

  return (
    <Box gap="s" flexDirection="row" justifyContent="center" alignContent="center">
      <Pressable onPress={removeMemberPressed}>
        <Avatar variant="small" profilePhoto={profilePhoto ?? DEFAULT_PROFILE_PHOTO} />
      </Pressable>
      <Box width="55%">
        <Pressable onPress={removeMemberPressed}>
          <Text ellipsizeMode="tail" variant="caption">
            <Text variant="captionBold">{description!.split(" ")[0]}</Text>{" "}
            <Text variant="caption">
              {description?.split(" ").slice(1, description?.split(" ").length).join(" ")}
            </Text>{" "}
            <Text variant="caption" color="slate">
              {categorizeTime(new Date(createdAt).toISOString())}
            </Text>
          </Text>
        </Pressable>
      </Box>
      <Pressable onPress={() => router.push(`/(app)/view-post/${postId}`)}>
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
      </Pressable>
    </Box>
  );
};

export default NotificationCard;
