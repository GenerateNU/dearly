import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Avatar } from "@/design-system/components/shared/avatar";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import React from "react";
import { GroupMember } from "@/types/group";

interface MemberProps extends GroupMember {
  managerView: boolean;
}

const ViewGroupProfile: React.FC<MemberProps> = ({ id, name, profilePhoto, managerView, role }) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  const nudge = () => {
    console.log(`Nudging ${name}`);
  };

  return (
    <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
      <Box>
        <Avatar variant="small" profilePhoto={profile} />
      </Box>
      <Box>
        <Text>{name}</Text>
      </Box>
      {managerView && role === "MEMBER" && (
        <Box>
          <TextButton onPress={nudge} label="Nudge" disabled={false} variant="primary" />
        </Box>
      )}
    </Box>
  );
};

export default ViewGroupProfile;
