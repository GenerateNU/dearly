import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { Text } from "@/design-system/base/text";
import { useUserGroups } from "@/hooks/api/user";

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

  const hasGroups = data?.pages.some((page) => page.length > 0);

  if (!data || !hasGroups) {
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
    </Box>
  );
};

export default Home;
