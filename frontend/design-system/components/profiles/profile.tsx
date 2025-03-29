import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { formatDay, getZodiacIcon } from "@/utilities/time";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { Avatar } from "@/design-system/components/shared/avatar";

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
  const formattedBirthday = new Date(birthday ? birthday : "");
  //Birthdays are always off by 1 :(
  formattedBirthday.setDate(formattedBirthday.getDate() + 1);
  return (
    <Box width={"100%"} gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
      <Box>
        <Avatar variant="medium" profilePhoto={profile} />
      </Box>
      <Box gap="xs" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
        <Text variant="bodyLargeBold">{name ? name : username}</Text>
        {bio && (
          <Box width="83%">
            <Text>{bio}</Text>
          </Box>
        )}
        {birthday && (
          <Box gap="xs" flexDirection="row" alignItems="center" justifyContent="center">
            <Icon name={getZodiacIcon(birthday)} color="ink" />
            <Text>{birthday ? formatDay(formattedBirthday) : ""}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
