import { useFeedContext } from "@/contexts/feed-post-context";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { EmptyLikesDisplay } from "@/design-system/components/posts/empty-likes";
import { LikeCard } from "@/design-system/components/posts/like-card";
import { LikeSkeleton } from "@/design-system/components/posts/like-skeleton";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { useGetAllLikeUsers } from "@/hooks/api/like";
import { SearchedUser } from "@/types/user";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";

export const LikesPage = () => {
  const { likePostId } = useFeedContext();
  const {
    data: likeData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useGetAllLikeUsers(likePostId);

  const likes = likeData?.pages.flatMap((page) => page) || [];

  const likeResources = {
    data: likes,
    loading: isLoading,
    error: error ? error.message : null,
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Box padding="m" alignItems="center">
        <LikeSkeleton />
      </Box>
    );
  };

  const renderItem = ({ item }: { item: SearchedUser }) => (
    <LikeCard
      name={item.name ?? ""}
      profilePhoto={item.profilePhoto ?? null}
      username={item.username ?? ""}
      id={item.id ?? ""}
    />
  );

  const SuccessComponent = () => {
    return (
      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
          <Box flexDirection="row" gap="s" alignItems="center">
            <Text variant="h1">Likes</Text>
          </Box>
          <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
        </Box>
        {likes.length !== 0 ? (
          <FlatList
            data={likes}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            onEndReached={onEndReached}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{
              paddingTop: 5,
              paddingBottom: 200,
            }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        ) : (
          <EmptyLikesDisplay />
        )}
      </Box>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Box paddingTop="xl">
        <ResourceView
          resourceState={likeResources}
          loadingComponent={
            <Box flex={1} width="100%" paddingTop="m" alignItems="center">
              <Spinner />
            </Box>
          }
          errorComponent={<ErrorDisplay refresh={refetch} />}
          emptyComponent={<EmptyLikesDisplay />}
          successComponent={<SuccessComponent />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default LikesPage;
