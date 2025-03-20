import { Box } from "@/design-system/base/box";
import { Icon } from "../icons/icon";
import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { useUserStore } from "@/auth/store";
import { useUserGroups } from "@/hooks/api/user";
import { useEffect, useState } from "react";

interface SwitchGroupProps {
  onPress: () => void;
}

const SwitchGroupButton: React.FC<SwitchGroupProps> = ({ onPress }) => {
  const { group, setSelectedGroup } = useUserStore();
  const { data, isLoading, error } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page) || [];
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {

    if (!group) {
      setIsInitialized(false)
    }
    if (isInitialized || isLoading || error) {
      return;
    }

    if (groups.length === 0) {
      return;
    }

    const shouldUpdateGroup = !group || !groups.some((g) => g.id === group.id);
    if (shouldUpdateGroup && groups[0]) {
      setSelectedGroup(groups[0]);
    }

    setIsInitialized(true);
  }, [groups, isLoading, error, group, setSelectedGroup]);

  if (!group || groups.length === 0) {
    return null;
  } 

  const displayName = group.name.length > 10 ? `${group.name.substring(0, 8)}...` : group.name;

  return (
    <BaseButton variant="text" onPress={onPress}>
      <Box
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        flexDirection="row"
        gap="xs"
      >
        <Text color="ink" variant="bodyLargeBold">
          {displayName}
        </Text>
        <Icon color="ink" name="arrow-down-drop-circle-outline" />
      </Box>
    </BaseButton>
  );
};

export default SwitchGroupButton;
