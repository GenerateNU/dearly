import { Box } from "@/design-system/base/box";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Avatar } from "../shared/avatar";

export const LikeSkeleton = () => {
  const profile = DEFAULT_PROFILE_PHOTO;

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
      </Box>
    </Box>
  );
};
