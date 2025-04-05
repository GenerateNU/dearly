/* eslint-disable react-hooks/rules-of-hooks */
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import React, { useRef, useState, useCallback, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import Spinner from "@/design-system/components/shared/spinner";
import { Animated } from "react-native";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useUserStore } from "@/auth/store";
import { useFeedContext } from "@/contexts/feed-post-context";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { EmptyFeed } from "@/design-system/components/posts/empty-feed";
import { PostSkeleton } from "@/design-system/components/posts/post-skeleton";
import { CommentLikesPopup } from "@/design-system/components/posts/comment-like-popup";
import { PostWithComment } from "@/design-system/components/posts/post-with-comment";
import { Mode } from "@/types/mode";
import { router } from "expo-router";

interface FeedProps {
  date?: string;
  commentRef?: React.RefObject<BottomSheetMethods>;
  likeRef?: React.RefObject<BottomSheetMethods>;
}

const Feed: React.FC<FeedProps> = ({
  date,
  commentRef = useRef<BottomSheet>(null),
  likeRef = useRef<BottomSheet>(null),
}) => {
  const { group, mode } = useUserStore();
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, refetch } = useGroupFeed(
    group?.id as string,
    date,
  );

  useEffect(() => {
    if (date) {
      refetch();
    }
  }, [date, refetch]);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [scrollY] = useState(new Animated.Value(0));
  const posts = data?.pages.flatMap((page) => page) || [];

  const { setCommentAttributes, setLikePostId } = useFeedContext();

  useEffect(() => {
    refetch();
  }, [group]);

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onClickComment = (id: string, caption: string, likes: number) => {
    setCommentAttributes({ commentId: id, caption: caption, likes: likes });
    if (mode == Mode.ADVANCED) {
      commentRef.current?.snapToIndex(0);
    } else {
      router.push("/(app)/comment");
    }
  };

  const onClickLikes = useCallback((postId: string) => {
    setLikePostId(postId);
    if (mode == Mode.ADVANCED) {
      likeRef.current?.snapToIndex(0);
    } else {
      router.push("/(app)/likes");
    }
  }, []);

  const renderFooter = () => {
    if (!isFetchingNextPage || isLoading) return null;
    return <PostSkeleton />;
  };

  const renderItem = ({ item }: { item: Post }) => {
    return (
      <Box paddingBottom="m">
        <PostWithComment
          item={item}
          onClickComment={() =>
            onClickComment(item.id!, item.caption ? item.caption : "", item.likes!)
          }
          onClickLike={() => onClickLikes(item.id!)}
        />
      </Box>
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  if (isLoading) {
    return (
      <Box width="100%" style={{ minHeight: 420 }} flex={1} paddingHorizontal="m">
        <PostSkeleton />
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box
        width="100%"
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="m"
        style={{ minHeight: 420 }}
      >
        <EmptyFeed displayText={date ? false : true} />
      </Box>
    );
  }

  return (
    <Box>
      {refreshing && (
        <AnimatedBox
          style={{
            width: "100%",
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          }}
        >
          <Spinner size={25} topOffset={30} />
        </AnimatedBox>
      )}
      <Box>
        <FlatList
          onEndReached={onEndReached}
          showsVerticalScrollIndicator={false}
          data={posts}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            paddingBottom: 200,
            paddingHorizontal: 20,
          }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          refreshControl={
            <RefreshControl
              tintColor="transparent"
              colors={["transparent"]}
              style={{ backgroundColor: "transparent" }}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </Box>
      {mode == Mode.ADVANCED && <CommentLikesPopup commentRef={commentRef} likeRef={likeRef} />}
    </Box>
  );
};

export default Feed;
