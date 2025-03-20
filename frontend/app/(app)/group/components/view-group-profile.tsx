import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Avatar } from "@/design-system/components/shared/avatar";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import React from "react";
import { GroupMember } from "@/types/group";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BaseButton } from "@/design-system/base/button";
import { useRemoveMemberContext } from "@/contexts/remove-meber";

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
}) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;
  const { setUser } = useRemoveMemberContext();

  const nudge = () => {
    console.log(`Nudging ${name}`);
  };

  const removeMemberPressed = () => {
    setUser({
      id,
      username,
    });
    onPress();
  };

  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
        <Box>
          <Avatar variant="small" profilePhoto={profile} />
        </Box>
        <Box>
          {name && <Text variant="bodyBold">{name}</Text>}
          <Box
            alignContent="center"
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            gap="xxs"
          >
            <Text variant="caption">@{username}</Text>
            {role === "MANAGER" && <Icon size={20} name="account-outline" />}
          </Box>
        </Box>
      </Box>
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
            <TextButton onPress={nudge} label="Nudge" disabled={false} variant="primary" />
            <Icon onPress={removeMemberPressed} name="dots-vertical" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ViewGroupProfile;
