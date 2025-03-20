import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import PostSkeleton from "./skeleton";
import { useToggleLike } from "@/hooks/api/like";
import { CommentInput } from "./comment-input";
import { useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";

const Feed = () => {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } = useGroupFeed();
  const posts = data?.pages.flatMap((page) => page) || [];
  const [currentId, setCurrentId] = useState<string>("");
  const ref = useRef<BottomSheet>(null);

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onClickComment = (id: string) => {
    setCurrentId(id)
    ref.current?.snapToIndex(0);
  }

  // TODO: add notification when all posts are seen
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
          onCommentClicked={() => null}
        />
        <CommentInput onPress ={() => onClickComment(item.id)}/>
   
      </Box>
    );
  };

  return (
    <>
    <FlatList
      onEndReached={onEndReached}
      showsVerticalScrollIndicator={false}
      data={posts}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      onEndReachedThreshold={0.5}
    ></FlatList>
     <CommentPopUp ref={ref} id={currentId}/>
    </>
    
  );
};

export default Feed;
