import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { TextButton } from "../shared/buttons/text-button";
import EmptyDataDisplay from "../shared/states/empty";

export const EmptyHomePage = () => {
  return (
    <EmptyDataDisplay>
      <Box width="100%">
        <Text variant="caption">
          Create a group or join a group. You can join a group through an invite link sent to you by
          a group administrator.
        </Text>
      </Box>
      <Box>
        <TextButton onPress={() => router.push("/group")} variant="primary" label="Create Group" />
      </Box>
    </EmptyDataDisplay>
  );
};
