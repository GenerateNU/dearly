import { Avatar } from "./avatar";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Icon } from "./icon";
import { formatDay, getZodiacIcon } from "@/utilities/time";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

interface ProfileProps {
  profilePhoto: string | null;
  bio: string | null;
  birthday: string | null;
  name: string | null;
  username: string;
}

export const Profile: React.FC<ProfileProps> = ({
  profilePhoto,
  bio,
  birthday,
  name,
  username,
}) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;
  return (
    <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
      <Box>
        <Avatar variant="medium" profilePhoto={profile} />
      </Box>
      <Box gap="xs" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
        <Text variant="body">{name ? name : username}</Text>
        {bio && (
          <Box width="83%">
            <Text>{bio}</Text>
          </Box>
        )}
        {birthday && (
          <Box gap="xs" flexDirection="row" alignItems="center" justifyContent="center">
            <Icon name={getZodiacIcon(birthday)} color="ink" size={30} />
            <Text>{formatDay(new Date(birthday))}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
