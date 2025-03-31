import React from "react";
import { MasonryFlashList } from "@shopify/flash-list";
import { Photo } from "./photo";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { router } from "expo-router";

interface MasonryFeedProps {
  posts: Post[];
  onEndReached: () => void;
}

export const MasonryList: React.FC<MasonryFeedProps> = ({ posts, onEndReached }) => {
  return (
    <Box
      flex={1}
      width="100%"
      height="100%" // Ensure full height
      style={{ minHeight: "100%" }} // Minimum height to fit content
    >
      <MasonryFlashList
        data={posts}
        numColumns={2}
        scrollEnabled={false}
        // onEndReachedThreshold={0.8}
        // onEndReached={onEndReached}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={100} // Add an estimated item size
        renderItem={({ item, index }) => (
          <Box
            width="100%"
            height="100%"
            padding="s"
            paddingRight={index % 2 === 0 ? "s" : "none"}
            paddingLeft={index % 2 !== 0 ? "s" : "none"}
          >
            <Photo
              image={item.media?.[0]?.url ?? ""}
              onPress={() => {
                router.push(`/(app)/view-post/${item.id}`);
              }}
            />
          </Box>
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
      />
    </Box>
  );
};
