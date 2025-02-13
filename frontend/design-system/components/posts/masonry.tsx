import React from "react";
import { MasonryFlashList } from "@shopify/flash-list";
import Box from "@/design-system/base/box";
import { Photo } from "./photo";

interface MasonryFeedProps {
  data: string[];
}

export const MasonryList: React.FC<MasonryFeedProps> = ({ data }) => {
  return (
    <MasonryFlashList
      data={data}
      numColumns={2}
      renderItem={({ item, index }) => (
        <Box
          width="100%"
          height="100%"
          padding="s"
          paddingRight={index % 2 === 0 ? "s" : "none"}
          paddingLeft={index % 2 !== 0 ? "s" : "none"}
        >
          <Photo image={item} />
        </Box>
      )}
      estimatedItemSize={200}
    />
  );
};
