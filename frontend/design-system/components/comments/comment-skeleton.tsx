import { Box } from "@/design-system/base/box";
import { Avatar } from "../shared/avatar";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";

export const CommentSkeleton = () => {
  return (
    <Box width="100%">
      <Box
        gap="s"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        paddingBottom="xs"
      >
        <Box>
          <Avatar variant="xsmall" profilePhoto={DEFAULT_PROFILE_PHOTO} />
        </Box>
      </Box>
    </Box>
  );
};
