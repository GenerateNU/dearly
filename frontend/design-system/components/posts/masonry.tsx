import React from "react";
import { MasonryFlashList } from "@shopify/flash-list";
import { Box } from "@/design-system/base/box";
import { Photo } from "./photo";
import { BaseButton } from "@/design-system/base/button";
import { Post } from "@/types/post";

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
          <BaseButton
            variant="text"
            onPress={() => console.log("Sending you to the post", item.id)}
          >
            <Box
              width="100%"
              height="100%"
              padding="s"
              paddingRight={index % 2 === 0 ? "s" : "none"}
              paddingLeft={index % 2 !== 0 ? "s" : "none"}
            >
              <Photo image={item.media![0]?.url!} />
            </Box>
          </BaseButton>
        )}
        estimatedItemSize={200}
      />
    </Box>
  );
};
