import ImageCarousel from "./carousel";
import { Post } from "@/types/post";
import { CommentLike } from "./comment-like";
import { PostHeader } from "./header";
import { Media } from "@/types/media";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useState } from "react";

interface Props {
  onCommentClicked: () => void;
  onLikeClicked: () => void;
}

export const ImagePost: React.FC<Required<Post> & Props> = ({
  profilePhoto,
  username,
  name,
  id,
  userId,
  createdAt,
  location,
  isLiked,
  comments,
  likes,
  caption,
  media,
  onCommentClicked,
  onLikeClicked,
}) => {
  const [like, setLike] = useState(isLiked);
  const data = media
    .filter(
      (item): item is Required<Pick<Media, "url">> =>
        typeof item.url === "string" && item.url !== "",
    )
    .map((item) => item.url);
  return (
    <Box flexDirection="column" gap="s">
      <PostHeader
        name={name}
        username={username}
        profilePhoto={profilePhoto}
        location={location}
        createdAt={createdAt}
        onPress={() => null}
      />
      <ImageCarousel setLike={() => setLike(!like)} like={like} data={data} />
      <CommentLike
        onCommentClicked={onCommentClicked}
        onLikeClicked={onLikeClicked}
        liked={like}
        postId={id}
        likes={likes}
        comments={comments}
      />
      <Box gap="s" flexDirection="row" justifyContent="flex-start" alignItems="flex-start">
        <Box>
          <Text>💬</Text>
        </Box>
        <Box width="90%">
          <Text>{caption}</Text>
        </Box>
      </Box>
    </Box>
  );
};
