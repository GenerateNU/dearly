import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "../shared/avatar";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";

export const CommentSkeleton = () => {
  return (
    <Box width="100%" gap="s">
      <Box gap="s" flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Box>
          <Avatar variant="small" profilePhoto={DEFAULT_PROFILE_PHOTO} />
        </Box>
      </Box>
    </Box>
  );
};
