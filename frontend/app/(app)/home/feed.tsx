import { ImagePost } from "@/design-system/components/posts/post";
import { FlatList } from "react-native-gesture-handler";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { useGroupFeed } from "@/hooks/api/post";
import PostSkeleton from "./skeleton";
import { useRef, useState, useEffect} from "react";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";
import Input from "@/design-system/components/shared/controls/input";
import MultitrackAudio from "@/assets/audio.svg";

const Feed = () => {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } = useGroupFeed();
  const posts = data?.pages.flatMap((page) => page) || [];
  const [currentId, setCurrentId] = useState<string>("");
  const [button, setButton] = useState<boolean>(true);
  const ref = useRef<BottomSheet>(null);

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {

  }, [ref.current])

  const onClickComment = (id: string) => {
    setCurrentId(id);
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
          onCommentClicked={() => null}
        />
        <Input
            isButton
            onPress={() => onClickComment(item.id)}
            placeholder="Write or record a message..."
            rightIcon={<MultitrackAudio />}
        />
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
