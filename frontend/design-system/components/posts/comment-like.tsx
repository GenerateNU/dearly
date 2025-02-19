import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { Icon } from "../ui/icon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface CommentLikeProps {
  postId: string;
  likes: number;
  comments: number;
  liked: boolean;
  onCommentClicked: () => void;
  onLikeClicked: () => void;
}

export const CommentLike: React.FC<CommentLikeProps> = ({
  postId,
  likes,
  comments,
  liked,
  onCommentClicked,
  onLikeClicked,
}) => {
  return (
    <>
      <Box gap="m" flexDirection="row" alignItems="center">
        <BaseButton variant="text" onPress={onCommentClicked}>
          <Box gap="xs" flexDirection="row" justifyContent="center" alignItems="center">
            <MaterialIcons name="chat-bubble-outline" size={30} color="ink" />
            <Text>{comments} COMMENTS</Text>
          </Box>
        </BaseButton>
        <BaseButton variant="text" onPress={onLikeClicked}>
          <Box gap="xs" flexDirection="row" justifyContent="center" alignItems="center">
            <Icon name={liked ? "cards-heart" : "cards-heart-outline"} color="ink" size={30} />
            <Text>{likes} LIKE</Text>
          </Box>
        </BaseButton>
      </Box>
    </>
  );
};
