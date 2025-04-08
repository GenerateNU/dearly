import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { router } from "expo-router";
import { PageButton } from "../buttons/page-button";

const GroupOptionContent = () => {
  const { group, userId } = useUserStore();

  if (!group) return null;

  const isManager = userId === group.managerId;

  return (
    <Box gap="s" flexDirection="column">
      <Text color="darkGray" variant="caption">
        More Options
      </Text>
      {isManager ? (
        <Box gap="s">
          <PageButton
            onPress={() => router.push("/(app)/group/change-name")}
            label="Change Group Name"
          />
          <PageButton
            onPress={() => router.push("/(app)/group/add-member")}
            label="Add New Member"
          />
          <PageButton
            onPress={() => router.push("/(app)/group/set-nudge")}
            label="Set Recurring Nudge"
          />
          <RedTextButton
            onPress={() => router.push("/(app)/group/delete")}
            label="Delete Group"
            icon="trash-can-outline"
          />
        </Box>
      ) : (
        <RedTextButton
          onPress={() => router.push("/(app)/group/leave")}
          label="Leave Group"
          icon="logout"
        />
      )}
    </Box>
  );
};

export default GroupOptionContent;
