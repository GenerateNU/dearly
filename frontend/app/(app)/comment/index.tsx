import React from "react";
import { CommentSkeleton } from "@/design-system/components/comments/comment-skeleton";
import { useComments } from "@/hooks/api/post";
import { commentPopUpAttributes } from "@/types/comment";
import { Box } from "@/design-system/base/box";
import { CommentCard } from "@/design-system/components/comments/comment";
import { Comment } from "@/types/post";
import { Text } from "@/design-system/base/text";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFeedContext } from "@/contexts/feed-post-context";
import CommentInput from "../home/comment-input";
import { KeyboardAvoidingView, Platform } from "react-native";

export const CommentPage = () => {
  const { commentAttributes } = useFeedContext();
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, error, refetch } =
    useComments(commentAttributes.commentId);
  const comments = data?.pages.flatMap((page: any) => page) || [];

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
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"} paddingTop="xl">
        <Text variant="h1" paddingBottom="m">
          Reactions
        </Text>
        <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
        <FlatList
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
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{
          position: "absolute",
          bottom: 25,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Box padding="s">
          <CommentInput postID={commentAttributes.commentId} />
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CommentPage;
