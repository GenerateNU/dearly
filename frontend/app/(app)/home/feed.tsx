/* eslint-disable react-hooks/rules-of-hooks */
import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import React, { useRef, useState, useCallback, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import Input from "@/design-system/components/shared/controls/input";
import MultitrackAudio from "@/assets/audio.svg";
import Spinner from "@/design-system/components/shared/spinner";
import { Animated } from "react-native";
import { LikePopup } from "@/design-system/components/posts/like-popup";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useUserStore } from "@/auth/store";
import { useFeedContext } from "@/contexts/feed-post-context";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { EmptyFeed } from "@/design-system/components/posts/empty-feed";

interface FeedProps {
  date?: string;
  popup: boolean;
  commentRef: React.RefObject<BottomSheetMethods>;
  likeRef: React.RefObject<BottomSheetMethods>;
}

interface CommentLikesPopupProps {
  commentRef: React.RefObject<BottomSheetMethods>;
  likeRef: React.RefObject<BottomSheetMethods>;
}

export const CommentLikesPopup: React.FC<CommentLikesPopupProps> = ({ commentRef, likeRef }) => {
  const { commentAttributes, likePostId } = useFeedContext();

  return (
    <>
      <CommentPopUp ref={commentRef} attributes={commentAttributes} />
      <LikePopup ref={likeRef} postId={likePostId} />
    </>
  );
};

const Feed: React.FC<FeedProps> = ({
  date,
  popup = true,
  commentRef = useRef<BottomSheet>(null),
  likeRef = useRef<BottomSheet>(null),
}) => {
  const { group } = useUserStore();
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
    commentRef.current?.snapToIndex(0);
  };

  const onClickLikes = useCallback((postId: string) => {
    setLikePostId(postId);
    likeRef.current?.expand();
  }, []);

  const renderFooter = () => {
    if (!isFetchingNextPage || isLoading) return null;
    return <PostSkeleton />;
  };

  const renderItem = ({ item }: { item: Post }) => {
    return (
      <Box paddingBottom="m" gap="s">
        <ImagePost
          profilePhoto={item.profilePhoto}
          username={item.username}
          name={item.name}
          id={item.id}
          userId={item.userId}
          createdAt={item.createdAt}
          location={item.location}
          isLiked={item.isLiked}
          comments={item.comments}
          caption={item.caption}
          media={item.media}
          likes={item.likes}
          groupId={item.groupId}
          onLikeClicked={() => onClickLikes(item.id)}
          onCommentClicked={() => onClickComment(item.id, item.caption, item.likes)}
        />
        <Input
          isButton
          onPress={() => onClickComment(item.id, item.caption, item.likes)}
          placeholder="Write or record a message..."
          rightIcon={<MultitrackAudio />}
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

  if (posts.length === 0) {
    return (
      <Box flex={1} padding="m">
        <EmptyFeed />
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
      {popup && <CommentLikesPopup commentRef={commentRef} likeRef={likeRef} />}
    </Box>
  );
};

export default Feed;
