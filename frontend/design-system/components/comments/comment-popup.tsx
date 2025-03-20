import React, {forwardRef} from "react";
import { CommentCard } from "./comment";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Comment } from "@/types/post";
import { useComments } from "@/hooks/api/post";


interface CommentPopUpProps {
  id: string; // postId
}

export const CommentPopUp = forwardRef<BottomSheetMethods, CommentPopUpProps>((props, ref) => {
  return (
    <BottomSheetModal ref={ref} snapPoints={["50%", "90%"]}>
      {props.id == "" ? <CommentPopUpBlank/> : <CommentPopUpData id={props.id}/>}
    </BottomSheetModal>
  );
});

const CommentPopUpBlank = (() => {
  return (
    <></>
  )
});

const CommentPopUpData: React.FC<CommentPopUpProps> = ({id}) => {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useComments(id);
  const comments = data?.pages.flatMap((page) => page) || [];

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // TODO: add notification when all posts are seen
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <> </>;
  };

  const renderItem = ({ item }: {item: Comment}) => (
    <CommentCard
      id={item.id}
      userId={item.userId}
      postId={item.postId}
      voiceMemo={item.voiceMemo}
      content={item.content}
      createdAt={item.createdAt}
      username={item.username}
      profilePhoto={item.profilePhoto}
    />
  );

  return (
      <Box flex={1} width="100%" padding="s">
        <Text paddingBottom="s" variant="body" textAlign="center">
          Welcome to Dearly 💛
        </Text>

        <BottomSheetFlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator
          style={{ flex: 1 }}
        />
      </Box>
  );
};














CommentPopUp.displayName = "CommentPopUp";
