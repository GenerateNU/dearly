import MultitrackAudio from "@/assets/audio.svg";
import { Box } from "@/design-system/base/box";
import { ImagePost } from "./post";
import { Post } from "@/types/post";
import Input from "../shared/controls/input";

interface PostWithCommentProps {
  onClickLike: () => void;
  onClickComment: () => void;
}

export const PostWithComment = ({
  item,
  onClickComment,
  onClickLike,
}: { item: Post } & PostWithCommentProps) => {
  return (
    <Box gap="s">
      <ImagePost
        profilePhoto={item.profilePhoto ? item.profilePhoto : null}
        username={item.username!}
        name={item.name ? item.name : ""}
        id={item.id!}
        userId={item.userId!}
        createdAt={item.createdAt!}
        location={item.location ? item.location : ""}
        isLiked={item.isLiked!}
        comments={item.comments!}
        caption={item.caption ? item.caption : ""}
        media={item.media!}
        likes={item.likes!}
        groupId={item.groupId!}
        onLikeClicked={onClickLike}
        onCommentClicked={onClickComment}
      />
      <Input
        isButton
        onPress={onClickComment}
        placeholder="Write or record a message..."
        rightIcon={<MultitrackAudio />}
      />
    </Box>
  );
};
