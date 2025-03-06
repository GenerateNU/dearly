import { useLocalSearchParams } from "expo-router";
import { ImagePost } from "@/design-system/components/posts/post";
import { getPost } from "@/api/post";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "@/design-system/components/ui/icon-button";
import { router } from "expo-router";
import { BaseButton } from "@/design-system/base/button";
import { Icon } from "@/design-system/components/ui/icon";

const ViewPost = () => {
  const { id: postId } = useLocalSearchParams<{ id: string }>();
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "posts", postId],
    queryFn: async () => await getPost(postId!),
  });
  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return !isPending && !isError && data ? (
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
  ) : (
    <></>
  );
};

interface ErrorPageProps {
  error: Error;
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  return (
    <Box width={"100%"} height={"100%"} pt="l">
      <Box width={"90%"} alignItems="flex-start" pt="xxl" pl="s">
        <IconButton variant="text" onPress={() => router.back()} icon="chevron-left" />
      </Box>
      <Box p="xxl" pt="none">
        <Text variant="h2">Oops!</Text>
        <Text variant="body">
          Erm... this is embarrising. The post you are viewing does not exist. Please refresh the
          app and try again.
        </Text>
        <Text variant="caption" color="warning">
          Error: {error.message}
        </Text>
      </Box>
    </Box>
  );
};

export default ViewPost;
