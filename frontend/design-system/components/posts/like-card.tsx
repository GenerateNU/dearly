import { Box } from "@/design-system/base/box";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Text } from "@/design-system/base/text";
import { Avatar } from "../shared/avatar";
import { SearchedUser } from "@/types/user";

export const LikeCard: React.FC<SearchedUser> = ({ name, profilePhoto }) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  return (
    <Box width="100%">
      <Box
        gap="m"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        paddingVertical="m"
      >
        <Box>
          <Avatar variant="small" profilePhoto={profile} />
        </Box>
        <Text variant="bodyLarge">{name}</Text>
      </Box>
    </Box>
  );
};
