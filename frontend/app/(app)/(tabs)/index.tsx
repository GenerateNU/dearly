import { Box } from "@/design-system/base/box";
import { useUserGroups } from "@/hooks/api/group";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/ui/text-button";
import { useInvitations } from "@/hooks/api/invite";

const Home = () => {
  const { data, isLoading } = useUserGroups();

  if (isLoading) {
    return (
      <Box
        padding="m"
        gap="xl"
        alignItems="center"
        justifyContent="center"
        backgroundColor="pearl"
        flex={1}
      >
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        padding="m"
        gap="xl"
        alignItems="center"
        justifyContent="center"
        backgroundColor="pearl"
        flex={1}
      >
        <EmptyHomePage />
      </Box>
    );
  }

  return (
    <Box
      padding="m"
      gap="xl"
      alignItems="center"
      justifyContent="center"
      backgroundColor="pearl"
      flex={1}
    >
      <Text>Home</Text>
      <TextButton variant="text" label="Send Message" onPress={useInvitations} />
    </Box>
  );
};

export default Home;
