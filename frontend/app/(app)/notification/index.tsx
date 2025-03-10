import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { EmptyPage } from "@/design-system/components/ui/empty";
import { useUserNotification } from "@/hooks/api/user";
import { SafeAreaView } from "react-native-safe-area-context";

const Notification = () => {
  const { data, isLoading, error, isFetchingNextPage } = useUserNotification();
  const notifications = data?.pages.flatMap((page) => page) || [];

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
          <></>
        )}
      </Box>
    </SafeAreaView>
  );
};

export default Notification;
