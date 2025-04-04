import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import User from "@/design-system/components/profiles/user";

const ProfilePage = () => {
  const { userId, group } = useUserStore();

  if (!group) {
    return (
      <Box width="100%" flex={1} padding="m">
        <EmptyHomePage />
      </Box>
    );
  }

  return <User id={userId!} />;
};

export default ProfilePage;
