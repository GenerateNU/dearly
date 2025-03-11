import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useInvitations } from "@/hooks/api/invite";

const Profile = () => {
  const { logout } = useUserStore();

  return (
    <Box gap="xl" alignItems="center" justifyContent="center" backgroundColor="pearl" flex={1}>
      <TextButton variant="text" label="Logout" onPress={logout} />
      <TextButton variant="text" label="Send Message" onPress={useInvitations} />
    </Box>
  );
};

export default Profile;
