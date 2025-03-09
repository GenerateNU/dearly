import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/ui/text-button";

const Profile = () => {
  const { logout } = useUserStore();

  return (
    <Box gap="xl" alignItems="center" justifyContent="center" backgroundColor="pearl" flex={1}>
      <TextButton variant="text" label="Logout" onPress={logout} />
    </Box>
  );
};

export default Profile;
