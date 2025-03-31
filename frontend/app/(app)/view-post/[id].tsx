import { useFeedContext } from "@/contexts/feed-post-context";
import { Box } from "@/design-system/base/box";
import { CommentLikesPopup } from "@/design-system/components/posts/comment-like-popup";
import { PostWithComment } from "@/design-system/components/posts/post-with-comment";
import { usePost } from "@/hooks/api/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { PostSkeleton } from "@/design-system/components/posts/post-skeleton";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { Post } from "@/types/post";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { BackHandler, Keyboard, StyleSheet, View } from "react-native";

const ViewPost = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postQuery = usePost(id);
  const { isLoading, data, error, refetch } = postQuery;

  const { setCommentAttributes, setLikePostId } = useFeedContext();
  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isLikeOpen, setIsLikeOpen] = useState(false);

  // Handle back button to close sheets instead of navigating back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isCommentOpen) {
        commentRef.current?.close();
        return true;
      }
      if (isLikeOpen) {
        likeRef.current?.close();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isCommentOpen, isLikeOpen]);

  // Handle sheet changes
  const handleCommentSheetChange = useCallback((index: number) => {
    setIsCommentOpen(index !== -1);
  }, []);

  const handleLikeSheetChange = useCallback((index: number) => {
    setIsLikeOpen(index !== -1);
  }, []);

  const onClickLikes = useCallback(
    (postId: string) => {
      if (!postId) return;

      setLikePostId(postId);
      setIsLikeOpen(true);

      // Make sure keyboard is dismissed before opening sheet
      Keyboard.dismiss();

      // Slight delay to ensure keyboard is fully dismissed
      setTimeout(() => {
        likeRef.current?.snapToIndex(0);
      }, 100);
    },
    [setLikePostId],
  );

  const onClickComment = useCallback(
    (id: string, caption: string, likes: number) => {
      if (!id) return;

      setCommentAttributes({ commentId: id, caption: caption, likes: likes });
      setIsCommentOpen(true);

      // Make sure keyboard is dismissed before opening sheet
      Keyboard.dismiss();

      // Slight delay to ensure keyboard is fully dismissed
      setTimeout(() => {
        commentRef.current?.snapToIndex(0);
      }, 100);
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

      <View style={styles.popupContainer} pointerEvents="box-none">
        <CommentLikesPopup offset={0} commentRef={commentRef} likeRef={likeRef} />
      </View>
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
