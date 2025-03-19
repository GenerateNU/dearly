import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewGroupProfile from "./components/view-group-profile";
import { useGroupMembers } from "@/hooks/api/group";
import { FlatList } from "react-native";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { GroupMember } from "@/types/group";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";

const NudgeMember = () => {
  const { group, userId } = useUserStore();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useGroupMembers(group?.id as string);

  const members = data?.pages?.flatMap((page) => page) || [];

  if (!group) return; // should never happen

  const isManager = group.managerId === userId;

  const renderItem = ({ item }: { item: GroupMember }) => {
    return (
      <ViewGroupProfile
        id={item.id}
        name={item.name}
        profilePhoto={item?.profilePhoto}
        managerView={isManager}
        role={item.role}
      />
    );
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const membersState = {
    data: members,
    loading: isLoading || isRefetching,
    error: error ? error.message : null,
  };

  // TODO: create loading skeleton
  const SuccessComponent = () => (
    <FlatList
      style={{ width: "100%" }}
      contentContainerStyle={{ paddingVertical: 20 }}
      data={members}
      renderItem={renderItem}
      keyExtractor={(_, index) => `member-${index}`}
      // ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">{group.name}</Text>
        <ResourceView
          resourceState={membersState}
          successComponent={<SuccessComponent />}
          loadingComponent={null}
          errorComponent={<ErrorDisplay refresh={refetch} />}
          emptyComponent={<EmptyDataDisplay />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default NudgeMember;
