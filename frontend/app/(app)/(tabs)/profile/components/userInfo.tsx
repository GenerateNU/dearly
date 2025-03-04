import { Box } from "@/design-system/base/box";
import { Profile } from "@/design-system/components/profiles/profile";

interface UserInfoProps {
  username: string;
  name: string;
  profilePhoto?: string;
  bio?: string;
  birthday?: string;
}

const UserInfo = ({ username, name, profilePhoto, bio, birthday }: UserInfoProps) => {
  return (
    <Box width="100%" maxWidth="100%">
      <Profile
        username={username}
        profilePhoto={profilePhoto ? profilePhoto : ""}
        bio={bio ? bio : ""}
        birthday={birthday ? birthday : ""}
        name={name}
      />
    </Box>
  );
};

export default UserInfo;
