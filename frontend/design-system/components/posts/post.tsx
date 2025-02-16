import ImageCarousel from "./carousel";
import { Post } from "@/types/post";
import { CommentLike } from "./comment-like";
import { PostHeader } from "./header";
import { Media } from "@/types/media";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

export const ImagePost: React.FC<Post> = ({
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
}) => {
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
      <ImageCarousel like={isLiked} data={data} />
      <CommentLike postId={id} likes={likes} comments={comments} />
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
