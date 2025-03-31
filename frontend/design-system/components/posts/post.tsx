import ImageCarousel from "./carousel";
import { Post } from "@/types/post";
import { CommentLike } from "./comment-like";
import { PostHeader } from "./header";
import { Media } from "@/types/media";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useToggleLike } from "@/hooks/api/like";
import { useUserStore } from "@/auth/store";
import { useState } from "react";
import { router } from "expo-router";

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
  caption,
  likes,
  media,
  onLikeClicked,
  onCommentClicked,
  groupId,
}) => {
  const { group } = useUserStore();
  const data = media
    .filter(
      (item: any): item is Required<Pick<Media, "url">> =>
        typeof item.url === "string" && item.url !== "",
    )
    .map((item: any) => item.url);

  const { mutate, isSuccess, isError } = useToggleLike(id, group?.id as string);
  const [pending, setPending] = useState<boolean>(false);

  const toggleLike = () => {
    setPending(true);
    mutate();
    if (isSuccess || isError) {
      setPending(false);
    }
  };

  return (
    <Box flexDirection="column" gap="s">
      <PostHeader
        id={userId}
        name={name}
        username={username}
        profilePhoto={profilePhoto}
        location={location}
        createdAt={createdAt}
        onPress={() => router.push(`/(app)/user/${userId}`)}
      />
      <ImageCarousel setLike={toggleLike} like={pending || isLiked} data={data} />
      <CommentLike
        onCommentClicked={onCommentClicked}
        onLikeClicked={onLikeClicked}
        liked={isLiked}
        postId={id}
        likes={likes}
        comments={comments}
      />
      {caption && (
        <Box
          width="90%"
          gap="s"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Text>💬</Text>
          <Text>{caption}</Text>
        </Box>
      )}
    </Box>
  );
};
