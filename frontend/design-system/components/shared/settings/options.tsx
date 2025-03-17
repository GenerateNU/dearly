import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { useGetInviteToken } from "@/hooks/api/group";
import { Alert, Share } from "react-native";

const GroupOptionContent = () => {
  const { group, userId } = useUserStore();
  const { data, isLoading, error } = useGetInviteToken(group?.id! as string);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      Alert.alert("Failed to get invite link. Please try again later.");
    }
  }, [error]);

  if (!group) return;

  const isManager = userId === group.managerId;

  const invite = async () => {
    const url = Linking.createURL(`/(app)/(tabs)?token=${data?.token}`);
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
    <Box gap="s" flexDirection="column">
      <Text color="darkGray" variant="caption">
        More Options
      </Text>
      {isManager ? (
        <Box gap="s">
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null}
            label="Change Group Name"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null}
            label="Nudge All"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={invite}
            label={isLoading ? "Generating Invite Link..." : "Invite Member"}
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null}
            label="Set Recurring Nudge"
            variant="text"
          />
          <RedTextButton onPress={() => null} label="Delete Group" icon="trash-can-outline" />
        </Box>
      ) : (
        <RedTextButton onPress={() => null} label="Leave Group" icon="logout" />
      )}
    </Box>
  );
};

export default GroupOptionContent;
