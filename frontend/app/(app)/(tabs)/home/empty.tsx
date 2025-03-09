import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/ui/text-button";
import { router } from "expo-router";

export const EmptyHomePage = () => {
  return (
    <Box
      width="100%"
      alignContent="center"
      justifyContent="flex-start"
      alignItems="flex-start"
      gap="m"
    >
      <Illustration width="100%" />
      <Box gap="xs" width="100%">
        <Text variant="bodyLargeBold">Nothing to see here!</Text>
        <Text variant="caption">
          Create a group or join a group. You can join a group through an invite link sent to you by
          a group administrator.
        </Text>
      </Box>
      <TextButton
        onPress={() => router.push("/group")}
        variant="honeyRounded"
        label="Create Group"
      />
    </Box>
  );
};
