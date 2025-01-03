import { useAuth } from "@/auth/provider";
import Box from "@/design-system/base/box";
import Button from "@/design-system/components/button";

const Home = () => {
  const { logout } = useAuth();
  return (
    <Box
      gap="xl"
      alignItems="center"
      justifyContent="center"
      backgroundColor="cardPrimaryBackground"
      flex={1}
      margin="m"
    >
      <Button label="Logout" onPress={logout} />
    </Box>
  );
};

export default Home;
