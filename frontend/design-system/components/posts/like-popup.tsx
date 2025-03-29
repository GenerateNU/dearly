import React, { forwardRef, useState } from "react";
import { Box } from "@/design-system/base/box";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Text } from "@/design-system/base/text";
import { LikeCard } from "./like-card";
import { CommentSkeleton } from "../comments/comment-skeleton";
import { SearchedUser } from "@/types/user";
import { useGetAllLikeUsers } from "@/hooks/api/like";

interface LikePopUpDataProps {
  postId: string;
}

export const LikePopup = forwardRef<BottomSheetMethods, { postId: string }>((props, ref) => {
  const [index, setIndex] = useState<number>(-1);

  return (
    <BottomSheetModal ref={ref} snapPoints={["60%"]} onChange={(index: number) => setIndex(index)}>
      {props.postId ? <LikePopUpData postId={props.postId} /> : <LikePopUpBlank />}
    </BottomSheetModal>
  );
});

const LikePopUpBlank = () => {
  return <></>;
};

const LikePopUpData: React.FC<LikePopUpDataProps> = ({ postId }) => {
  const {
    data: likeData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllLikeUsers(postId);
  const likes = likeData?.pages.flatMap((page) => page) || [];

  const onEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Box padding="m" alignItems="center">
        <CommentSkeleton />
      </Box>
    );
  };

  const renderItem = ({ item }: { item: SearchedUser }) => (
    <LikeCard
      name={item.name ?? ""}
      profilePhoto={item.profilePhoto ?? null}
      username={item.username ?? ""}
      id={item.id ?? ""}
    />
  );

  return (
    <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
      <Box flexDirection="column" gap="s">
        <Box flexDirection="row" gap="s" alignItems="center">
          <Text variant="bodyLargeBold">
            {likes.length === 1 ? "1 like" : `${likes.length} likes`}
          </Text>
        </Box>
        <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
      </Box>
      <BottomSheetFlatList
        data={likes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingTop: 5,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
    </Box>
  );
};

LikePopup.displayName = "LikePopup";
