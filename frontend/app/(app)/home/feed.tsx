import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import PostSkeleton from "./skeleton";
import React, { useRef, useState, useCallback, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import Input from "@/design-system/components/shared/controls/input";
import MultitrackAudio from "@/assets/audio.svg";
import { commentPopUpAttributes } from "@/types/comment";
import Spinner from "@/design-system/components/shared/spinner";
import { Animated } from "react-native";
import { LikePopup } from "@/design-system/components/posts/like-popup";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useUserStore } from "@/auth/store";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";

interface FeedProps {
  date?: string;
}

const Feed: React.FC<FeedProps> = ({ date }) => {
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

  const [commentAttributes, setCommentAttributes] = useState<commentPopUpAttributes>({
    commentId: "",
    likes: 0,
    caption: "",
  });
  const ref = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);
  const [likePostId, setLikePostId] = useState<string>("");

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
    ref.current?.snapToIndex(0);
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
        <EmptyDataDisplay />
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
      <CommentPopUp ref={ref} attributes={commentAttributes} />
      <LikePopup ref={likeRef} postId={likePostId} />
    </Box>
  );
};

export default Feed;
