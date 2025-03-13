import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserNotification } from "@/hooks/api/user";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationCard from "./components/notification-card";
import { Notification as NotificationType } from "@/types/user";
import { FlatList } from "react-native-gesture-handler";
import NotificationSkeleton from "./components/skeleton";
import ResourceView from "@/design-system/components/utilities/resource-view";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import LoadingNotifications from "./components/loading";

const Notification = () => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useUserNotification();

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const notifications = data?.pages.flatMap((page) => page) || [];

  const renderItem = ({ item }: { item: NotificationType }) => {
    return (
      <Box paddingBottom="m">
        <NotificationCard
          postId={item.postId}
          createdAt={item.createdAt}
          referenceType={item.referenceType}
          mediaURL={item.mediaURL}
          actorId={item.actorId}
          description={item.description}
          receiverId={item.receiverId}
          title={item.title}
        />
      </Box>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <NotificationSkeleton />;
  };

  const notificationStates = {
    data: notifications,
    loading: isLoading || isRefetching,
    error: error ? error.message : null,
  };

  const Notifications = () => (
    <FlatList
      style={{ width: "100%" }}
      contentContainerStyle={{ paddingVertical: 20 }}
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(_, index) => `notification-${index}`}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">Notifications</Text>
        <ResourceView
          resourceState={notificationStates}
          loadingComponent={<LoadingNotifications />}
          emptyComponent={<EmptyDataDisplay />}
          successComponent={<Notifications />}
          errorComponent={<ErrorDisplay refresh={refetch} />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default Notification;
