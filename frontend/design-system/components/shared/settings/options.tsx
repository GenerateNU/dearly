import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { router } from "expo-router";

const GroupOptionContent = () => {
  const { group, userId } = useUserStore();

  if (!group) return;

  const isManager = userId === group.managerId;

  return (
    <Box gap="s" flexDirection="column">
      <Text color="darkGray" variant="caption">
        More Options
      </Text>
      {isManager ? (
        <Box gap="s">
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null}
            label="Change Group Name"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => router.push("/(app)/group/add-member")}
            label="Add New Member"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null}
            label="Set Recurring Nudge"
            variant="text"
          />
          <RedTextButton
            onPress={() => router.push("/(app)/group/delete")}
            label="Delete Group"
            icon="trash-can-outline"
          />
        </Box>
      ) : (
        <RedTextButton onPress={() => null} label="Leave Group" icon="logout" />
      )}
    </Box>
  );
};

export default GroupOptionContent;
