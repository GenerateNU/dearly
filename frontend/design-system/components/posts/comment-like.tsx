import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";

interface CommentLikeProps {
  postId: string;
  likes: number;
  comments: number;
}

export const CommentLike: React.FC<CommentLikeProps> = ({ postId, likes, comments }) => {
  return (
    <Box flexDirection="row" gap="s">
      <BaseButton variant="text" onPress={() => null}>
        <Text>{comments} COMMENTS</Text>
      </BaseButton>
      <Text>•</Text>
      <BaseButton variant="text" onPress={() => null}>
        <Text>{likes} LIKES</Text>
      </BaseButton>
    </Box>
  );
};
