import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { EmptyPage } from "../shared/states/empty";
import { TextButton } from "../shared/buttons/text-button";

export const EmptyHomePage = () => {
  return (
    <Box width="100%" alignContent="center" justifyContent="center" alignItems="center" gap="m">
      <EmptyPage />
      <Box width="100%">
        <Text variant="caption">
          Create a group or join a group. You can join a group through an invite link sent to you by
          a group administrator.
        </Text>
      </Box>
      <TextButton onPress={() => router.push("/group")} variant="primary" label="Create Group" />
    </Box>
  );
};
