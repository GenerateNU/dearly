import { Box } from "@/design-system/base/box";
import { FlatList } from "react-native";
import MemberSkeleton from "./member-skeleton";

const LoadingMembers = () => {
  const skeletonData = Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` }));

  return (
    <Box flex={1} width="100%" paddingTop="m">
      <FlatList
        data={skeletonData}
        renderItem={() => (
          <Box paddingBottom="s">
            <MemberSkeleton />
          </Box>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </Box>
  );
};

export default LoadingMembers;
