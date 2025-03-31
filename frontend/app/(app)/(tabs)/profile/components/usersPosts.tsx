import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import { MasonryList } from "@/design-system/components/posts/masonry";
import { useMemberPost } from "@/hooks/api/post";
import ResourceView from "@/design-system/components/utilities/resource-view";
import { EmptyFeed } from "@/design-system/components/posts/empty-feed";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";

const UserPosts = ({ id }: { id: string }) => {
  const { group, userId } = useUserStore();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    isLoading,
    refetch,
    error,
  } = useMemberPost(group?.id as string, id);

  const posts = data?.pages.flatMap((page) => page);

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const SuccessComponent = () => (
    <Box width={"100%"} height={"auto"}>
      <MasonryList onEndReached={loadMore} posts={posts} />
    </Box>
  );

  const state = {
    loading: isLoading || isRefetching,
    error: error ? error.message : null,
    data: posts,
  };

  return (
    <>
      <Text paddingBottom="s" variant="bodyLargeBold">
        Posts
      </Text>
      <ResourceView
        resourceState={state}
        successComponent={<SuccessComponent />}
        loadingComponent={
          <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        }
        emptyComponent={userId === id ? <EmptyFeed /> : <EmptyDataDisplay />}
        errorComponent={
          <Box paddingTop="xl">
            <ErrorDisplay refresh={refetch} />
          </Box>
        }
      />
    </>
  );
};

export default UserPosts;
