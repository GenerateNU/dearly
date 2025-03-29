import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { TextButton } from "../shared/buttons/text-button";
import EmptyDataDisplay from "../shared/states/empty";

type EmptyCommentsProps = {
    caption:string
}

export const EmptyCommentDisplay: React.FC<EmptyCommentsProps>  = ( {caption} ) => {
  return (
    <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
            <Box flexDirection="row" gap="s" alignItems="center">
                <Text>💬</Text>
                <Text>{caption}</Text>
            </Box>
            <Box flexDirection="row" gap="xs" alignItems="center">
                <Text variant="bodyBold"> No comments yet... </Text>
            </Box>
            <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
        </Box>
    </Box>
  );
};