import { useFeedContext } from "@/contexts/feed-post-context";
import { Box } from "@/design-system/base/box";
import { CommentLikesPopup } from "@/design-system/components/posts/comment-like-popup";
import { PostWithComment } from "@/design-system/components/posts/post-with-comment";
import { usePost } from "@/hooks/api/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useMemo, useState } from "react";
import { PostSkeleton } from "@/design-system/components/posts/post-skeleton";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { Post } from "@/types/post";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { Keyboard, StyleSheet, View } from "react-native";

const ViewPost = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postQuery = usePost(id);
  const { isLoading, data, error, refetch } = postQuery;

  const { setCommentAttributes, setLikePostId } = useFeedContext();
  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isLikeOpen, setIsLikeOpen] = useState(false);

  const onClickLikes = useCallback(
    (postId: string) => {
      setLikePostId(postId);
      router.push("/(app)/likes");
    },
    [setLikePostId],
  );

  const onClickComment = useCallback(
    (id: string, caption: string, likes: number) => {
      setCommentAttributes({ commentId: id, caption: caption, likes: likes });
      router.push("/(app)/comment");
    },
    [setCommentAttributes],
  );

  const state = useMemo(
    () => ({
      loading: isLoading,
      data,
      error: error ? error.message : null,
    }),
    [isLoading, data, error],
  );

  const SuccessComponent = useMemo(() => {
    return function SuccessView() {
      return (
        <Box flex={1}>
          <PostWithComment
            item={data as Post}
            onClickComment={() =>
              onClickComment(id, data?.caption ? data.caption : "", data?.likes ? data.likes : 0)
            }
            onClickLike={() => onClickLikes(id)}
          />
        </Box>
      );
    };
  }, [data, id, onClickComment, onClickLikes]);

  return (
    <View style={styles.container}>
      <Box
        width="100%"
        className="mt-[25%]"
        flex={1}
        padding="m"
        style={[(isCommentOpen || isLikeOpen) && styles.lowerZIndex]}
      >
        <ResourceView
          resourceState={state}
          successComponent={<SuccessComponent />}
          loadingComponent={<PostSkeleton />}
          errorComponent={<ErrorDisplay refresh={refetch} />}
        />
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  lowerZIndex: {
    zIndex: 1,
  },
  popupContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default ViewPost;
