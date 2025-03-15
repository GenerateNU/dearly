import { useUserGroups } from "@/hooks/api/user";
import { SelectItem } from "./controls/select";
import { Group } from "@/types/group";
import ResourceView from "../utilities/resource-view";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import ErrorDisplay from "./states/error";
import Spinner from "./spinner";
import { useUserStore } from "@/auth/store";
import { TextButton } from "./buttons/text-button";
import { router } from "expo-router";

const SelectGroup = () => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
    isRefetching,
  } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page);
  const { group, setSelectedGroup } = useUserStore();

  const groupState = {
    data: groups,
    loading: isLoading || isRefetching || isFetchingNextPage,
    error: error ? error.message : null,
  };

  const getNextPage = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const EmptyComponent = () => (
    <Box>
      <Text>No groups found.</Text>
    </Box>
  );

  const SuccessComponent = () => (
    <>
      <SelectItem
        selected={group}
        fetchNextPage={getNextPage}
        setSelected={setSelectedGroup}
        data={groups}
        renderLabel={(item: Group) => item.name}
      />
      <Box paddingTop="m">
        <TextButton onPress={() => router.push("/group")} variant="primary" label="Create Group" />
      </Box>
    </>
  );

  const LoadingComponent = () => (
    <Box width="100%" justifyContent="center" alignItems="center">
      <Spinner />
    </Box>
  );

  return (
    <ResourceView
      resourceState={groupState}
      successComponent={<SuccessComponent />}
      loadingComponent={<LoadingComponent />}
      errorComponent={<ErrorDisplay isBottomSheet />}
      emptyComponent={<EmptyComponent />}
    />
  );
};

export default SelectGroup;
