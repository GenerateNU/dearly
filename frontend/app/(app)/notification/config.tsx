import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import Toggle from "@/design-system/components/shared/toggle";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { useConfigNotification, useMemberInfo } from "@/hooks/api/member";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native";

type NotificationSettings = {
  likeNotificationEnabled: boolean;
  commentNotificationEnabled: boolean;
  postNotificationEnabled: boolean;
  nudgeNotificationEnabled: boolean;
};

type NotificationSettingKey = keyof NotificationSettings;

const NotificationConfig = () => {
  const { group } = useUserStore();
  const groupId = group?.id || "";

  const { data, isLoading, error } = useMemberInfo(groupId);
  const { mutate, isPending, error: configError } = useConfigNotification(groupId);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(
    null,
  );

  useEffect(() => {
    if (data) {
      setNotificationSettings({
        likeNotificationEnabled: !!data.likeNotificationEnabled,
        commentNotificationEnabled: !!data.commentNotificationEnabled,
        postNotificationEnabled: !!data.postNotificationEnabled,
        nudgeNotificationEnabled: !!data.nudgeNotificationEnabled,
      });
    }
  }, [data]);

  const handleToggle = (type: NotificationSettingKey) => {
    if (!notificationSettings || !data || !groupId) return;
    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    };

    mutate({
      groupId,
      ...updatedSettings,
    });
  };

  if (!group || !groupId) {
    return (
      <SafeAreaView className="flex-1">
        <Box
          width="100%"
          paddingHorizontal="m"
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <ErrorDisplay />
        </Box>
      </SafeAreaView>
    );
  }

  const state = {
    data,
    loading: isLoading,
    error: error?.message || configError?.message || null,
  };

  const SuccessComponent = () => {
    if (!notificationSettings) {
      return <Spinner />;
    }

    return (
      <Box gap="l">
        <Toggle
          label="Likes"
          enabled={notificationSettings.likeNotificationEnabled}
          onToggle={() => handleToggle("likeNotificationEnabled")}
          isPending={isPending}
        />
        <Toggle
          label="Comments"
          enabled={notificationSettings.commentNotificationEnabled}
          onToggle={() => handleToggle("commentNotificationEnabled")}
          isPending={isPending}
        />
        <Toggle
          label="Posts"
          enabled={notificationSettings.postNotificationEnabled}
          onToggle={() => handleToggle("postNotificationEnabled")}
          isPending={isPending}
        />
      </Box>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingHorizontal="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="center"
        gap="m"
      >
        <Box width="100%">
          <Text variant="bodyLargeBold">Notifications</Text>
        </Box>
        <ResourceView
          resourceState={state}
          successComponent={<SuccessComponent />}
          loadingComponent={<Spinner />}
          errorComponent={<ErrorDisplay />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default NotificationConfig;
