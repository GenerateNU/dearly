import ImageCarousel from "./carousel";
import { Post } from "@/types/post";
import { CommentLike } from "./comment-like";
import { PostHeader } from "./header";
import { Media } from "@/types/media";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useCallback, useState } from "react";
import { useGetAllLikeUsers, useToggleLike } from "@/hooks/api/like";

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
  // likes,
  caption,
  media,
  onCommentClicked,
  groupId
}) => {
  const [like, setLike] = useState(isLiked);
  const data = media
    .filter(
      (item:any): item is Required<Pick<Media, "url">> =>
        typeof item.url === "string" && item.url !== "",
    )
    .map((item:any) => item.url);

  const { mutate } = useToggleLike(id, groupId);
  const { data: like_data, refetch } = useGetAllLikeUsers(id);

  const likePost = useCallback(() => {
    mutate();
    setLike(!like);
    refetch();
  }, [mutate, refetch]);

  const likes = like_data?.pages?.reduce((total, page) => total + page.length, 0) || 0;

  const onLikeClick = () => {
    null;
  };

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
      <ImageCarousel setLike={likePost} like={like} data={data} />
      <CommentLike
        onCommentClicked={onCommentClicked}
        onLikeClicked={onLikeClick}
        liked={like}
        postId={id}
        likes={likes}
        comments={comments}
      />
      <Box gap="s" flexDirection="row" justifyContent="flex-start" alignItems="center" >
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
