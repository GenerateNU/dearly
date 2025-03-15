import { Box } from "@/design-system/base/box";
import { Icon } from "../icons/icon";
import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { useUserStore } from "@/auth/store";
import { useUserGroups } from "@/hooks/api/user";
import { useEffect, useRef } from "react";

interface SwitchGroupProps {
  onPress: () => void;
}

const SwitchGroupButton: React.FC<SwitchGroupProps> = ({ onPress }) => {
  const { group, setSelectedGroup } = useUserStore();
  const { data, isLoading, error } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // not render button if no group, group is loading or fail to load group
    if (
      !groups ||
      groups.length === 0 ||
      !groups[0] ||
      hasInitialized.current ||
      isLoading ||
      error
    ) {
      return;
    }

    if (!group) {
      // If no group is selected, set the first group as selected
      setSelectedGroup(groups[0]);
    } else {
      // Check if current group exists in fetched groups
      const matchingGroup = groups.find((g) => g.id === group.id);

      if (matchingGroup) {
        // Only update if the data is actually different to prevent loops
        if (JSON.stringify(matchingGroup) !== JSON.stringify(group)) {
          setSelectedGroup(matchingGroup);
        }
      } else {
        // If no match found, default to first group
        setSelectedGroup(groups[0]);
      }
    }

    // Mark as initialized to prevent further updates
    hasInitialized.current = true;
  }, [groups, error, isLoading]);

  if (!groups || groups.length === 0 || !groups[0] || !group) {
    return null;
  }

  const displayName = group.name.length > 12 ? `${group.name.substring(0, 11)}...` : group.name;

  return (
    <BaseButton variant="text" onPress={onPress}>
      <Box alignItems="center" flexDirection="row" gap="xs">
        <Text color="ink" variant="h2">
          {displayName}
        </Text>
        <Icon color="ink" name="arrow-down-drop-circle-outline" />
      </Box>
    </BaseButton>
  );
};

export default SwitchGroupButton;
