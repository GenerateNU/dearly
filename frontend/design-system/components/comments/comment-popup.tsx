import React, { forwardRef, useRef, useState } from "react";
import { CommentCard } from "./comment";
import { Box } from "@/design-system/base/box";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Comment } from "@/types/post";
import { useComments } from "@/hooks/api/post";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, TextInput } from "react-native";
import { CommentInput } from "@/app/(app)/home/comment-input";
import { CommentSkeleton } from "./comment-skeleton";
import { Text } from "@/design-system/base/text";
import { commentPopUpAttributes } from "@/types/comment";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceView from "../utilities/resource-view";
import Spinner from "../shared/spinner";
import ErrorDisplay from "../shared/states/error";
import { EmptyCommentDisplay } from "./empty-comments";

interface CommentPopUpProps {
  attributes: commentPopUpAttributes;
  offset?: number;
}

interface CommentPopUpDataProps {
  attributes: commentPopUpAttributes;
  index: number;
}

export const CommentPopUp = forwardRef<BottomSheetMethods, CommentPopUpProps>(
  ({ attributes, offset = 169 }, ref) => {
    const [index, setIndex] = useState<number>(-1);
    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={["85%"]}
          onChange={(index: number) => setIndex(index)}
        >
          {attributes.commentId === "" ? (
            <CommentPopUpBlank />
          ) : (
            <CommentPopUpData attributes={attributes} index={index} />
          )}
        </BottomSheetModal>
        {index !== -1 && (
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? offset : 0}
            style={{
              position: "absolute",
              bottom: offset,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <Box backgroundColor="white" padding="s">
              <CommentInput postID={attributes.commentId} />
            </Box>
          </KeyboardAvoidingView>
        )}
      </>
    );
  },
);

const CommentPopUpBlank = () => {
  return <></>;
};

const CommentPopUpData: React.FC<CommentPopUpDataProps> = ({ attributes, index }) => {
  const ref = useRef<TextInput>(null);
  ref.current?.focus();
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, error, refetch } =
    useComments(attributes.commentId);
  const comments = data?.pages.flatMap((page) => page) || [];

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <CommentSkeleton />;
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <Box paddingVertical="s">
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

  const commentResources = {
    data: comments,
    loading: isLoading,
    error: error ? error.message : null,
  };

  const SuccessComponent = () => {
    return (
      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
          <Box width="90%" flexDirection="row" gap="s" alignItems="center">
            <Text>💬</Text>
            <Text>{attributes.caption}</Text>
          </Box>
          <Box flexDirection="row" gap="xs" alignItems="center">
            <Text variant="bodyBold">{attributes.likes + " likes"}</Text>
            <Box height={4} width={4} backgroundColor="ink" borderRadius="xl" />
            <Text variant="bodyBold"> {comments.length + " comments"} </Text>
          </Box>
          <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
        </Box>
        <BottomSheetFlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{
            paddingTop: 5,
            paddingBottom: 250,
          }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      </Box>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Pressable onPress={Keyboard.dismiss}>
        <ResourceView
          resourceState={commentResources}
          loadingComponent={
            <Box flex={1} paddingTop="m" alignItems="center">
              <Spinner />
            </Box>
          }
          errorComponent={<ErrorDisplay refresh={refetch} />}
          emptyComponent={<EmptyCommentDisplay caption={attributes.caption} />}
          successComponent={<SuccessComponent />}
        />
      </Pressable>
    </SafeAreaView>
  );
};

CommentPopUp.displayName = "CommentPopUp";
