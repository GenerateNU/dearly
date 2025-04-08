import { Box } from "@/design-system/base/box";
import { BaseButton } from "@/design-system/base/button";
import { Icon } from "../shared/icons/icon";

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
          <Icon label={`${comments} COMMENTS`} name="chat-outline" color="ink" />
        </BaseButton>
        <BaseButton variant="text" onPress={onLikeClicked}>
          <Icon
            label={`${likes} LIKE`}
            name={liked ? "cards-heart" : "cards-heart-outline"}
            color="ink"
          />
        </BaseButton>
      </Box>
    </>
  );
};
