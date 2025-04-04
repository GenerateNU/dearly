import { Box } from "@/design-system/base/box";
import { EmptyHomePage } from "@/design-system/components/home/empty";
import { useUserGroups } from "@/hooks/api/user";
import ResourceView from "@/design-system/components/utilities/resource-view";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import HomeMenu from "@/design-system/components/home/home-menu";
import Feed from "../home/feed";
import Calendar from "../home/calendar";
import Spinner from "@/design-system/components/shared/spinner";

const Home = () => {
  const { data, isLoading, error, refetch } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page) || [];
  const [selectedView, setSelectedView] = useState<string>("Feed");

  const groupsResource = {
    data: groups,
    loading: isLoading,
    error: error ? error.message : null,
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 pt-[35%]">
      <Box alignItems="center" justifyContent="flex-start" backgroundColor="pearl" flex={1}>
        {groups.length > 0 && (
          <Box width="100%" padding="m">
            <HomeMenu
              categories={["Feed", "Calendar"]}
              selected={selectedView}
              setSelected={setSelectedView}
            />
          </Box>
        )}
        <ResourceView
          resourceState={groupsResource}
          loadingComponent={
            <Box flex={1} justifyContent="center" alignItems="center">
              <Spinner />
            </Box>
          }
          errorComponent={
            <Box flex={1} padding="m">
              <ErrorDisplay refresh={refetch} />
            </Box>
          }
          emptyComponent={
            <Box width="100%" flex={1} padding="m">
              <EmptyHomePage />
            </Box>
          }
          successComponent={selectedView === "Feed" ? <Feed /> : <Calendar />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default Home;
