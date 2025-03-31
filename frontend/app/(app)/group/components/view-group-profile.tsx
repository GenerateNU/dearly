import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Avatar } from "@/design-system/components/shared/avatar";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import React, { useEffect, useMemo } from "react";
import { GroupMember } from "@/types/group";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { useRemoveMemberContext } from "@/contexts/remove-meber";
import { useManualNudge } from "@/hooks/api/member";
import { useUserStore } from "@/auth/store";
import { Alert, Pressable } from "react-native";

interface MemberProps extends GroupMember {
  managerView: boolean;
  onPress: () => void;
}

const ViewGroupProfile: React.FC<MemberProps> = ({
  id,
  username,
  name,
  profilePhoto,
  managerView,
  role,
  onPress,
  lastNudgedAt,
}) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;
  const { setUser } = useRemoveMemberContext();
  const { group } = useUserStore();
  const { mutate, isPending, error } = useManualNudge(group?.id as string);

  const isCoolingDown = useMemo(() => {
    if (!lastNudgedAt) return false;

    const lastNudgeDate = new Date(lastNudgedAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - lastNudgeDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference < 24;
  }, [lastNudgedAt]);

  const nudge = () => {
    mutate([id!]);
  };

  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Failed to send nudge. Please try again later.");
    }
  }, [error]);

  const removeMemberPressed = () => {
    setUser({
      id,
      username,
    });
    onPress();
  };

  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Pressable onPress={removeMemberPressed}>
        <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
          <Box>
            <Avatar variant="small" profilePhoto={profile} />
          </Box>
          <Box>
            {name && <Text variant="bodyBold">{name}</Text>}
            <Box alignContent="center" alignItems="center" flexDirection="row" gap="xxs">
              <Text variant="caption">@{username}</Text>
              {role === "MANAGER" && <Icon size={20} name="account-outline" />}
            </Box>
          </Box>
        </Box>
      </Pressable>
      {managerView && role === "MEMBER" && (
        <>
          <Box
            flexDirection="row"
            justifyContent="center"
            maxWidth="30%"
            alignItems="center"
            flexShrink={1}
            paddingRight="s"
          >
            <TextButton
              onPress={nudge}
              label="Nudge"
              disabled={isPending || isCoolingDown}
              variant="primary"
            />
            <Icon onPress={removeMemberPressed} name="dots-vertical" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ViewGroupProfile;
