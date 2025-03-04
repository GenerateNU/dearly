import React from "react";
import { MasonryFlashList } from "@shopify/flash-list";
import { Photo } from "./photo";
import { Box } from "@/design-system/base/box";
import { Post } from "@/types/post";
import { router } from "expo-router";

interface MasonryFeedProps {
  posts: Post[];
}

export const MasonryList: React.FC<MasonryFeedProps> = ({ posts }) => {
  return (
    <Box flex={1} width="100%">
      <MasonryFlashList
        data={posts}
        numColumns={2}
        renderItem={({ item, index }) => (
          <Box
            width="100%"
            height="100%"
            padding="s"
            paddingRight={index % 2 === 0 ? "s" : "none"}
            paddingLeft={index % 2 !== 0 ? "s" : "none"}
          >
            <Photo
              image={item.media![0]?.url!}
              onPress={() => {
                router.push(`/ViewPost/${item.id!}`);
              }}
            />
          </Box>
        )}
      />
    </Box>
  );
};
