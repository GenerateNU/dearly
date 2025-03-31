import { Box } from "@/design-system/base/box";
import { Comment } from "@/types/post";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Text } from "@/design-system/base/text";
import { formatTime } from "@/utilities/time";
import { Avatar } from "../shared/avatar";
import { Playback } from "./playback";
import { Pressable } from "react-native";
import { router } from "expo-router";

export const CommentCard: React.FC<Required<Comment>> = ({
  id,
  userId,
  voiceMemo,
  content,
  username,
  profilePhoto,
  createdAt,
}) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  return (
    <Box width="100%">
      <Pressable className="w-[100%]" onPress={() => router.push(`/(app)/user/${id}`)}>
        <Box
          gap="s"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          paddingBottom="xs"
        >
          <Box>
            <Avatar variant="xsmall" profilePhoto={profile} />
          </Box>
          <Text variant="bodyBold">{username}</Text>
          <Text variant="caption" color="slate">
            {formatTime(createdAt)}
          </Text>
        </Box>
      </Pressable>
      <Box>{content && <Text>{content}</Text>}</Box>
      {voiceMemo && <Playback id={id} local={false} location={voiceMemo} />}
    </Box>
  );
};
