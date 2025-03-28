import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList, RefreshControl, ScrollView } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import PostSkeleton from "./skeleton";
import React, { useRef, useState, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import Input from "@/design-system/components/shared/controls/input";
import MultitrackAudio from "@/assets/audio.svg";
import { commentPopUpAttributes } from "@/types/comment";
import Spinner from "@/design-system/components/shared/spinner";
import { Dimensions } from "react-native";
import { Animated } from "react-native";

const Feed = () => {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } = useGroupFeed();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [scrollY] = useState(new Animated.Value(0));
  const posts = data?.pages.flatMap((page) => page) || [];
  const [commentAttributes, setCommentAttributes] = useState<commentPopUpAttributes>({
    commentId: "",
    likes: 0,
    caption: "",
  });
  const ref = useRef<BottomSheet>(null);

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {}, [ref.current]);

  const onClickComment = (id: string, caption: string, likes: number) => {
    setCommentAttributes({ commentId: id, caption: caption, likes: likes });
    ref.current?.snapToIndex(0);
  };

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
          likes={item.likes}
          caption={item.caption}
          media={item.media}
          groupId={item.groupId}
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
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <Box>
      {refreshing && (
        <Animated.View
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
        </Animated.View>
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
            paddingBottom: 150,
            paddingHorizontal: 20
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
            ></RefreshControl>
          }
        ></FlatList>
      </Box>
      <CommentPopUp ref={ref} attributes={commentAttributes} />
    </Box>
  );
};

export default Feed;
