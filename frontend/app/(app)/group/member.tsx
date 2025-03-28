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
import RemoveMemberPopUp from "@/design-system/components/shared/settings/remove-member-popup";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import LoadingMembers from "./components/loading-member";
import MemberSkeleton from "./components/member-skeleton";

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
  const removeMemberRef = useRef<BottomSheet>(null);

  const onPress = () => {
    removeMemberRef.current?.snapToIndex(0);
  };

  if (!group) return null; // should never happen

  const isManager = group.managerId === userId;

  const renderItem = ({ item }: { item: GroupMember }) => {
    return (
      <Box paddingBottom="m">
        <ViewGroupProfile
          id={item.id}
          onPress={onPress}
          username={item.username}
          name={item.name}
          profilePhoto={item?.profilePhoto}
          managerView={isManager}
          role={item.role}
          lastNudgedAt={item.lastNudgedAt}
        />
      </Box>
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

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <MemberSkeleton />;
  };

  const SuccessComponent = () => (
    <FlatList
      style={{ width: "100%" }}
      contentContainerStyle={{ paddingVertical: 20 }}
      data={members}
      renderItem={renderItem}
      keyExtractor={(_, index) => `member-${index}`}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <>
      <SafeAreaView edges={["top"]} className="flex-1">
        <Box
          width="100%"
          paddingTop="xl"
          paddingHorizontal="m"
          flex={1}
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Text variant="bodyLargeBold">{group.name}</Text>
          <ResourceView
            resourceState={membersState}
            successComponent={<SuccessComponent />}
            loadingComponent={<LoadingMembers />}
            errorComponent={<ErrorDisplay refresh={refetch} />}
            emptyComponent={<EmptyDataDisplay />}
          />
        </Box>
      </SafeAreaView>
      <RemoveMemberPopUp ref={removeMemberRef} />
    </>
  );
};

export default NudgeMember;
