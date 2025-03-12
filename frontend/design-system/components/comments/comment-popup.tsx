import React, { forwardRef } from "react";
import { CommentCard } from "./comment";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";

const commentsData = [
  {
    id: "1",
    userId: "1",
    postId: "1",
    voiceMemo: "",
    content: "This is the first comment 💬",
    createdAt: new Date().toISOString(),
    username: "quokka",
    profilePhoto: "https://avatars.githubusercontent.com/u/123816878?v=4",
  },
  {
    id: "2",
    userId: "2",
    postId: "1",
    voiceMemo: "",
    content: "Second comment! 👍",
    createdAt: new Date().toISOString(),
    username: "quokka",
    profilePhoto: "https://avatars.githubusercontent.com/u/123816878?v=4",
  },
  {
    id: "3",
    userId: "3",
    postId: "1",
    voiceMemo: "",
    content: "Nice post, I agree! 💬",
    createdAt: new Date().toISOString(),
    username: "quokka",
    profilePhoto: "https://avatars.githubusercontent.com/u/123816878?v=4",
  },
  {
    id: "4",
    userId: "4",
    postId: "1",
    voiceMemo: "",
    content: "I love this post! 😍",
    createdAt: new Date().toISOString(),
    username: "quokka",
    profilePhoto: "https://avatars.githubusercontent.com/u/123816878?v=4",
  },
  {
    id: "5",
    userId: "5",
    postId: "1",
    voiceMemo: "",
    content: "Great work on this! 🌟",
    createdAt: new Date().toISOString(),
    username: "quokka",
    profilePhoto: "https://avatars.githubusercontent.com/u/123816878?v=4",
  },
];

interface CommentPopUpProps {
  id: string; // postId
}

export const CommentPopUp = forwardRef<BottomSheetMethods, CommentPopUpProps>((props, ref) => {
  const renderItem = ({ item }: { item: (typeof commentsData)[0] }) => (
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
    <BottomSheetModal ref={ref} snapPoints={["50%", "90%"]}>
      <Box flex={1} width="100%" padding="s">
        <Text paddingBottom="s" variant="body" textAlign="center">
          Welcome to Dearly 💛
        </Text>

        <BottomSheetFlatList
          data={commentsData}
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
    </BottomSheetModal>
  );
});

CommentPopUp.displayName = "CommentPopUp";
