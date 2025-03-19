import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Avatar } from "@/design-system/components/shared/avatar";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import React, { useRef } from "react";
import { GroupMember } from "@/types/group";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BaseButton } from "@/design-system/base/button";

interface MemberProps extends GroupMember {
  id: string;
  username: string;
  name: string;
  profilePhoto: string;
  managerView: boolean;
  role: string;
}

const ViewGroupProfile: React.FC<MemberProps> = ({
  id,
  username,
  name,
  profilePhoto,
  managerView,
  role,
}) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  const nudge = () => {
    console.log(`Nudging ${name}`);
  };

  //TODO: Have bottom sheet
  const removeMemberPressed = () => {
    console.log("Remove Member pop-up");
  };

  return (
    <Box flexDirection="row" justifyContent="space-between" paddingVertical="m">
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
            <BaseButton onPress={removeMemberPressed} variant="text">
              <Icon name="dots-vertical" />
            </BaseButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ViewGroupProfile;
