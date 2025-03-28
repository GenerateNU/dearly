import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { useUserGroups } from "@/hooks/api/user";
import ResourceView from "@/design-system/components/utilities/resource-view";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import Spinner from "@/design-system/components/shared/spinner";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/design-system/base/text";

const Home = () => {
  const { data, isLoading, error, refetch } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page) || [];

  const groupsResource = {
    data: groups,
    loading: isLoading,
    error: error ? error.message : null,
  };

  return (
    <SafeAreaView className="flex-1 pt-[35%]">
      <Box
        padding="m"
        gap="xl"
        alignItems="center"
        justifyContent="flex-start"
        backgroundColor="pearl"
        flex={1}
      >
        <ResourceView
          resourceState={groupsResource}
          loadingComponent={<Spinner />}
          errorComponent={<ErrorDisplay refresh={refetch} />}
          emptyComponent={<EmptyHomePage />}
          successComponent={<Text>Home Feed</Text>}
        />
      </Box>
    </SafeAreaView>
  );
};

export default Home;
