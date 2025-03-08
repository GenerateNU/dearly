import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextButton } from "@/design-system/components/ui/text-button";
import { useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/auth/store";
import { useGetInviteToken } from "@/hooks/api/group";
import { Share } from "react-native";
import * as Linking from "expo-linking";

const InviteLink = () => {
  const params = useLocalSearchParams();
  const { finishOnboarding } = useUserStore();
  const groupId = params.id;
  const groupName = params.name;
  const { data, isLoading, isError, error } = useGetInviteToken(groupId! as string);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const invite = async () => {
    const url = Linking.createURL(`/app/tabs?token=${data?.token}`);
    setInviteLink(url);

    if (inviteLink) {
      try {
        await Share.share({
          message: `Join my group on Dearly 💛: ${inviteLink}`,
        });
      } catch (error) {
        console.error("Error sharing link:", error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
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
              onPress={invite}
              variant="blushRounded"
            />
            {isError && <Text color="error">{error.message}</Text>}
          </Box>
        </Box>
        <Box width="100%" gap="m" alignItems="center" className="w-full">
          <TextButton label="Next" onPress={finishOnboarding} variant="honeyRounded" />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default InviteLink;
