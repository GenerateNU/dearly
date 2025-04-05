import React from "react"
import { CommentSkeleton } from "./comment-skeleton";
import { useComments } from "@/hooks/api/post";
import { commentPopUpAttributes } from "@/types/comment";
import { Box } from "@/design-system/base/box";
import { CommentCard } from "./comment";
import { Comment } from "@/types/post";
import { Text } from "@/design-system/base/text";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface CommentPageProps {
    attributes: commentPopUpAttributes;
  }

export const CommentPage: React.FC<CommentPageProps> = ({attributes}) => {
    const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, error, refetch } =
    useComments(attributes.commentId);
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
        <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
          {attributes.caption && (
            <Box width="90%" flexDirection="row" gap="s" alignItems="center">
              <Text>💬</Text>
              <Text>{attributes.caption}</Text>
            </Box>
          )}
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
    )
}