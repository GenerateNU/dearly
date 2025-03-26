import React, { forwardRef, useRef } from "react";
import { CommentCard } from "./comment";
import { Box } from "@/design-system/base/box";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Comment } from "@/types/post";
import { useComments } from "@/hooks/api/post";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { CommentInput } from "@/app/(app)/home/comment-input";

interface CommentPopUpProps {
  id: string; // postId
}

export const CommentPopUp = forwardRef<BottomSheetMethods, CommentPopUpProps>((props, ref) => {
  return (
    <BottomSheetModal ref={ref} snapPoints={["50%", "90%"]} >
      {props.id == "" ? <CommentPopUpBlank /> : <CommentPopUpData id={props.id} />}
    </BottomSheetModal>
  );
});

const CommentPopUpBlank = () => {
  return <></>;
};

const CommentPopUpData: React.FC<CommentPopUpProps> = ({ id }) => {
  const ref = useRef<TextInput>(null);
  ref.current?.focus();
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

  const renderItem = ({ item }: { item: Comment }) => (
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={180}
    >
      <Box height={"100%"} width={"100%"} padding="s">
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
        <Box ref={ref} position="relative">
          <CommentInput />
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
};

CommentPopUp.displayName = "CommentPopUp";
