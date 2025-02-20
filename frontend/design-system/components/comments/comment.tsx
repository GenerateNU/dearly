import { Box } from "@/design-system/base/box";
import { Comment } from "@/types/post";
import { Avatar } from "../ui/avatar";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Text } from "@/design-system/base/text";
import { formatTime } from "@/utilities/time";

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
    <Box width="100%" gap="s">
      <Box gap="s" flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Box>
          <Avatar variant="small" profilePhoto={profile} />
        </Box>
        <Box flexDirection="column" gap="xs">
          <Text variant="body">{username}</Text>
          <Text>{formatTime(createdAt)}</Text>
        </Box>
      </Box>
      <Box>{content && <Text>{content}</Text>}</Box>
    </Box>
  );
};
