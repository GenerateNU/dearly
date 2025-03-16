import React, { useState } from "react";
import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import PostSkeleton from "./skeleton";

const Feed = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useGroupFeed();

  const posts = data?.pages.flatMap((page) => page) || [];

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // TODO: add notification when all posts are seen
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <PostSkeleton/>;
  };

  const renderItem = ({ item }: { item: Post }) => {
    return (
      <Box paddingBottom="m">
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
          onCommentClicked // comment clicked
          onLikeClicked // like clicked 
        />
      </Box>
    );
  };

  return (
    <FlatList
      onEndReached={onEndReached}
      showsVerticalScrollIndicator={false}
      data={posts}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      onEndReachedThreshold={0.5}
    ></FlatList>
  );
};

export default Feed;
