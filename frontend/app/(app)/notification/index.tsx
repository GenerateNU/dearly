import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { EmptyPage } from "@/design-system/components/ui/empty";
import { useUserNotification } from "@/hooks/api/user";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationCard from "./components/notification-card";
import { Notification as NotificationType } from "@/types/user";
import { FlatList } from "react-native-gesture-handler";

const Notification = () => {
  const { data, isLoading, isFetchingNextPage, error, fetchNextPage } = useUserNotification();
  const notifications = data?.pages.flatMap((page) => page) || [];

  const renderItem = ({ item }: { item: NotificationType }) => {
    return (
      <NotificationCard
        createdAt={item.createdAt}
        referenceType={item.referenceType}
        mediaURL={item.mediaURL}
        actorId={item.actorId}
        description={item.description}
        receiverId={item.receiverId}
        title={item.title}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 w-full">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">Notifications</Text>
        {notifications.length === 0 ? (
          <Box
            width="100%"
            alignItems="center"
            justifyContent="center"
            backgroundColor="pearl"
            flex={1}
          >
            <EmptyPage />
          </Box>
        ) : (
          <FlatList
            onEndReachedThreshold={0.3}
            onEndReached={() => fetchNextPage}
            data={notifications}
            renderItem={renderItem}
          />
        )}
      </Box>
    </SafeAreaView>
  );
};

export default Notification;
