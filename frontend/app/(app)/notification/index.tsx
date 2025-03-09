import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserNotification } from "@/hooks/api/user";
import { SafeAreaView } from "react-native-safe-area-context";

const Notification = () => {
  const { data, isLoading, error, isFetchingNextPage } = useUserNotification();
  const notifications = data?.pages.flatMap((page) => page) || [];

  return (
    <SafeAreaView className="flex-1">
      <Box paddingTop="xl" padding="m" flex={1} justifyContent="flex-start" alignItems="flex-start">
        <Text variant="bodyLargeBold">Notifications</Text>
      </Box>
    </SafeAreaView>
  );
};

export default Notification;
