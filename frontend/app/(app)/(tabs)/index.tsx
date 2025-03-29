import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { useUserGroups } from "@/hooks/api/user";
import ResourceView from "@/design-system/components/utilities/resource-view";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import Spinner from "@/design-system/components/shared/spinner";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import HomeMenu from "@/design-system/components/home/home-menu";
import Feed from "../home/feed";
import Calendar from "../home/calendar";
import { FeedContextProvider } from "@/contexts/feed-post-context";

const Home = () => {
  const { data, isLoading, error, refetch } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page) || [];
  const [selectedView, setSelectedView] = useState<string>("Feed");

  const groupsResource = {
    data: groups,
    loading: isLoading,
    error: error ? error.message : null,
  };

  const SuccessComponent = () => (
    <Box flexDirection="column" gap="s">
      <FeedContextProvider>
        <Box paddingTop="m" paddingHorizontal="m">
          <HomeMenu
            categories={["Feed", "Calendar"]}
            selected={selectedView}
            setSelected={setSelectedView}
          />
        </Box>
        {selectedView === "Feed" ? <Feed /> : <Calendar />}
      </FeedContextProvider>
    </Box>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 pt-[35%]">
      <Box
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
          successComponent={<SuccessComponent />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default Home;
