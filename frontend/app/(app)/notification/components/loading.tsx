import { Box } from "@/design-system/base/box";
import NotificationSkeleton from "./skeleton";
import { FlatList } from "react-native";

const LoadingNotifications = () => {
  const skeletonData = Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` }));

  return (
    <Box flex={1} width="100%" paddingTop="m">
      <FlatList
        data={skeletonData}
        renderItem={() => (
          <Box paddingBottom="s">
            <NotificationSkeleton />
          </Box>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </Box>
  );
};

export default LoadingNotifications;
