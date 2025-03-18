import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/auth/store";
import { useGetInviteToken } from "@/hooks/api/group";
import { TextButton } from "../shared/buttons/text-button";
import { showSharePopup } from "@/utilities/invite";

interface InviteLinkProps {
  nextPageNavigate?: () => void;
}

const InviteLinkComponent: React.FC<InviteLinkProps> = ({ nextPageNavigate }) => {
  const params = useLocalSearchParams();
  const { finishOnboarding } = useUserStore();
  const groupId = params.id;
  const groupName = params.name;

  const { data, isLoading, isError, error } = useGetInviteToken(groupId! as string);

  return (
    <Box
      backgroundColor="pearl"
      className="w-full"
      flex={1}
      justifyContent="space-between"
      alignItems="flex-start"
      padding="m"
      gap="l"
    >
      <Box gap="l" width="100%">
        <Box gap="s">
          <Text variant="bodyLargeBold">{groupName} created!</Text>
          <Text variant="caption">
            Share the link with your friends and family for them to join your group
          </Text>
        </Box>
        <Box width="100%" gap="s" alignItems="center" className="w-full">
          <TextButton
            disabled={isLoading}
            label={"Copy Link"}
            onPress={() => showSharePopup(data?.token)}
            variant="secondary"
          />
          {isError && <Text color="error">{error.message}</Text>}
        </Box>
      </Box>
      <Box width="100%" gap="m" alignItems="center" className="w-full">
        <TextButton
          label="Next"
          onPress={nextPageNavigate ? nextPageNavigate : finishOnboarding}
          variant="primary"
        />
      </Box>
    </Box>
  );
};

export default InviteLinkComponent;
