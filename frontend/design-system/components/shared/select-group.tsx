import { useUserGroups } from "@/hooks/api/user";
import { SelectItem } from "./controls/select";
import { Group } from "@/types/group";
import ResourceView from "../utilities/resource-view";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import ErrorDisplay from "./states/error";
import Spinner from "./spinner";
import { useUserStore } from "@/auth/store";

const SelectGroup = () => {
  const { data, isLoading, isFetchingNextPage, error, refetch, isRefetching } = useUserGroups();
  const groups = data?.pages.flatMap((page) => page);
  console.log(groups);
  const { group, setSelectedGroup } = useUserStore();

  const groupState = {
    data: groups,
    loading: isLoading || isRefetching || isFetchingNextPage,
    error: error ? error.message : null,
  };

  const EmptyComponent = () => (
    <Box>
      <Text>No groups found.</Text>
    </Box>
  );

  const SuccessComponent = () => (
    <SelectItem
      selected={group}
      setSelected={setSelectedGroup}
      data={groups}
      renderLabel={(item: Group) => item.name}
    />
  );

  return (
    <ResourceView
      resourceState={groupState}
      successComponent={<SuccessComponent />}
      loadingComponent={<Spinner />}
      errorComponent={<ErrorDisplay isBottomSheet />}
      emptyComponent={<EmptyComponent />}
    />
  );
};

export default SelectGroup;
