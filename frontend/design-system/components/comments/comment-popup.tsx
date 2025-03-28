import React, { forwardRef, useEffect, useRef, useState } from "react";
import { CommentCard } from "./comment";
import { Box } from "@/design-system/base/box";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Comment } from "@/types/post";
import { useComments } from "@/hooks/api/post";
import { Keyboard, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { CommentInput } from "@/app/(app)/home/comment-input";
import { CommentSkeleton } from "./comment-skeleton";
import { Text } from "@/design-system/base/text";
import { commentPopUpAttributes } from "@/types/comment";

interface CommentPopUpProps {
  attributes: commentPopUpAttributes;
}

interface CommentPopUpDataProps {
  attributes: commentPopUpAttributes;
  index: number
}


export const CommentPopUp = forwardRef<BottomSheetMethods, CommentPopUpProps>((props, ref) => {
  const [index, setIndex] = useState<number>(-1)
  return (
    <>
    <BottomSheetModal ref={ref} snapPoints={["90%"]}  onChange={(index:number) => setIndex(index)}>
      {props.attributes.commentId == "" ? (
        <CommentPopUpBlank />
      ) : (
        <CommentPopUpData attributes={props.attributes} index={index}/>
      )}
    </BottomSheetModal>
    {index !== -1 && (
       <KeyboardAvoidingView 
        behavior="padding" // This makes content move up when keyboard appears
        keyboardVerticalOffset={Platform.OS === "ios" ? 169 : 0} // Adjust based on platform
       style={{
         position: 'absolute',
         bottom: 150,
         left: 0,
         right: 0,
         zIndex: 10
       }}
     >
       <Box backgroundColor="white" padding="s">
         <CommentInput postID={props.attributes.commentId} />
       </Box>
     </KeyboardAvoidingView>
    )}
    </>
  );
});

const CommentPopUpBlank = () => {
  return <></>;
};

const CommentPopUpData: React.FC<CommentPopUpDataProps> = ({ attributes, index }) => {
  const ref = useRef<TextInput>(null);
  ref.current?.focus();
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useComments(
    attributes.commentId,
  );
  const comments = data?.pages.flatMap((page) => page) || [];

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // TODO: add notification when all posts are seen
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <CommentSkeleton />;
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <Box paddingBottom="s">
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
    </Box>
  );

  return (

      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
          <Box flexDirection="row" gap="s">
            <Text>💬</Text>
            <Text>{attributes.caption}</Text>
          </Box>
          <Box flexDirection="row" gap="xs" alignItems="center">
            <Text variant="bodyBold">{attributes.likes + " likes"}</Text>
            <Box height={4} width={4} backgroundColor="ink" borderRadius="xl" />
            <Text variant="bodyBold"> {attributes.comments + " comments"} </Text>
          </Box>
          <Box borderRadius="xl" backgroundColor="slate" height={1} ></Box>
        </Box>
        <BottomSheetFlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{
            paddingTop: 5,
            paddingBottom: 200,
          }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
  
      </Box>
  );
};

CommentPopUp.displayName = "CommentPopUp";
