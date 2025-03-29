import { Box } from "@/design-system/base/box";
import { BaseButton } from "@/design-system/base/button";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

const InfoBar = () => {
  const { group, userId } = useUserStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });
  const groupName = group ? group.name : "Unknown";
  const onPressGroupName = () => {
    console.log("group names");
  };

  const onPressSettings = () => {
    console.log("settings");
  };

  return (
    <Box flexDirection="row" width={"100%"} justifyContent="space-between">
      <BaseButton variant="text" onPress={onPressGroupName}>
        <Box flexDirection="row" alignItems="center">
          <Text variant="bodyLarge">{groupName}</Text>
          <Icon name="arrow-down-drop-circle-outline" />
        </Box>
      </BaseButton>
      <BaseButton variant="text" onPress={onPressSettings}>
        <Box flex={1} flexDirection="row" alignItems="center" justifyContent="flex-end">
          <Text fontSize={14}>settings</Text>
          <Icon name="cog-outline" />
        </Box>
      </BaseButton>
    </Box>
  );
};

export default InfoBar;
