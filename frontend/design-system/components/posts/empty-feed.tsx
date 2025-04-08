import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { TextButton } from "../shared/buttons/text-button";
import EmptyDataDisplay from "../shared/states/empty";

export const EmptyFeed = ({ displayText = true }: { displayText?: boolean }) => {
  return (
    <EmptyDataDisplay>
      {displayText && (
        <>
          <Box width="100%" marginBottom="m">
            <Text variant="caption">
              No posts in this group yet, click the button to get started with your first post!
            </Text>
          </Box>
          <Box>
            <TextButton
              onPress={() => router.push("/(app)/post-creation")}
              variant="primary"
              label="Make Post"
            />
          </Box>
        </>
      )}
    </EmptyDataDisplay>
  );
};
