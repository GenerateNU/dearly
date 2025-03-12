import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { Text } from "@/design-system/base/text";
import { useUserGroups } from "@/hooks/api/user";
import ResourceView from "@/design-system/components/utilities/resource-view";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { ActivityIndicator } from "react-native";

const Home = () => {
  const { data, isLoading, error, refetch } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page) || [];

  const groupsResource = {
    data: groups,
    loading: isLoading,
    error: error ? String(error) : null,
  };

  return (
    <Box
      padding="m"
      gap="xl"
      alignItems="center"
      justifyContent="center"
      backgroundColor="pearl"
      flex={1}
    >
      <ResourceView
        resourceState={groupsResource}
        loadingComponent={<ActivityIndicator size="large" />}
        errorComponent={<ErrorDisplay refresh={refetch} />}
        emptyComponent={<EmptyHomePage />}
        successComponent={<Text>Home</Text>}
      />
    </Box>
  );
};

export default Home;
