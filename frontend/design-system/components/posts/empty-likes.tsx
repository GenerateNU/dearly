import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

export const EmptyLikesDisplay = () => {
  return (
    <Box position="relative" paddingHorizontal="m" height="100%" width="100%">
      <Box flexDirection="column" gap="m">
        <Box flexDirection="row" gap="s" alignItems="center" justifyContent="center" width="100%">
          <Text textAlign="center" variant="bodyLargeBold">
            No likes yet...
          </Text>
        </Box>
        <Box borderRadius="xl" backgroundColor="slate" height={1} />
      </Box>
    </Box>
  );
};
