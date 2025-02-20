import { useAuth } from "@/auth/provider";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/ui/text-button";

const Home = () => {
  const { logout } = useAuth();
  return (
    <Box gap="xl" alignItems="center" justifyContent="center" backgroundColor="pearl" flex={1}>
      <TextButton variant="honey" label="Logout" onPress={logout} />
    </Box>
  );
};

export default Home;
