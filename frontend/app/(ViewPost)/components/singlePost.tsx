import { Box } from "@/design-system/base/box";
import { IconButton } from "@/design-system/components/shared/buttons/icon-button";
import { router } from "expo-router";
import { Text } from "@/design-system/base/text";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { Post } from "@/types/post";
import { ImagePost } from "@/design-system/components/posts/post";

interface SinglePostProps {
  data: Post;
  postId: string;
}

const SinglePost = ({ data, postId }: SinglePostProps) => {
  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);
  return (
    <Box alignItems="center">
      <Box flexDirection="row" pt="xxl" alignItems="center" width="95%">
        <Box flex={1} alignItems="flex-start">
          <IconButton
            variant="text"
            onPress={() => {
              router.back();
              console.log("PRESSED");
            }}
            icon="chevron-left"
          />
        </Box>
        <Box flex={1} alignItems="center">
          <Text variant="h2">Post</Text>
        </Box>
        {/* Below box for spacing */}
        <Box flex={1} />
      </Box>

      <Box width="90%">
        <ImagePost
          id={postId}
          groupId={data!.groupId!}
          userId={data!.userId!}
          createdAt={data!.createdAt!}
          caption={data!.caption!}
          likes={data!.likes!}
          comments={data!.comments!}
          isLiked={data!.isLiked!}
          profilePhoto={data!.profilePhoto ? data!.profilePhoto : DEFAULT_PROFILE_PHOTO}
          name={data!.name ? data!.name! : null}
          username={data!.username!}
          location={data!.location ? data!.location! : null}
          media={data!.media!}
          onLikeClicked={() => {}}
          onCommentClicked={() => {}}
        />
      </Box>
      <CommentPopUp id={postId} ref={commentRef} />
      <CommentPopUp id={postId} ref={likeRef} />
    </Box>
  );
};

export default SinglePost;
