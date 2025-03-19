import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";

const DeleteGroup = () => {
  const { group } = useUserStore();

  if (!group) return; // should never happen

  // TODO: abstract this out, seems to be similar to other pages
  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <Box backgroundColor="pearl" className="w-full" flex={1} padding="m" gap="xl">
        <Box flexDirection="column" alignItems="flex-start" gap="s">
          <Text variant="bodyLargeBold">Delete Group?</Text>
          <Text variant="caption">
            Deleting a group cannot be undone. All photos uploaded in this group will deleted.
          </Text>
        </Box>
        <Box width="100%" gap="s" alignItems="center" className="w-full">
          <Box>
            <TextButton
              disabled={false}
              label="Delete Group"
              onPress={() => null}
              variant="primary"
            />
          </Box>
          {/* {isError && <Text color="error">{error.message}</Text>} */}
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default DeleteGroup;
