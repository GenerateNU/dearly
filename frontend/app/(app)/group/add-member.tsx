import { useGetInviteToken } from "@/hooks/api/group";
import { SafeAreaView } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUserStore } from "@/auth/store";
import { showSharePopup } from "@/utilities/invite";

const AddMember = () => {
  const { group } = useUserStore();
  const { data, isLoading, isError, error } = useGetInviteToken(group?.id as string);

  if (!group) return; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <Box backgroundColor="pearl" className="w-full" flex={1} padding="m" gap="xl">
        <Box flexDirection="column" alignItems="flex-start" gap="s">
          <Text variant="bodyLargeBold">Add Member to {group.name}</Text>
          <Text variant="caption">
            Share the link with your friends and family for them to join your group!
          </Text>
        </Box>
        <Box width="100%" gap="s" alignItems="center" className="w-full">
          <Box>
            <TextButton
              disabled={isLoading}
              label="Copy Link"
              onPress={() => showSharePopup(data?.token)}
              variant="primary"
            />
          </Box>
          {isError && <Text color="error">{error.message}</Text>}
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default AddMember;
