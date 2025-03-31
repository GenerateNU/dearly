import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { MasonryFlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ResourceView from "@/design-system/components/utilities/resource-view";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { useUser } from "@/hooks/api/user";
import { useMemberPost } from "@/hooks/api/post";
import { useUserStore } from "@/auth/store";
import UserInfo from "@/app/(app)/(tabs)/profile/components/userInfo";
import { EmptyFeed } from "@/design-system/components/posts/empty-feed";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";
import { Photo } from "../posts/photo";
import { Dimensions } from "react-native";

export const User = ({ id }: { id: string }) => {
  const {
    isLoading: isUserLoading,
    data: userData,
    error: userError,
    refetch: refetchUser,
    isRefetching: isUserRefetching,
  } = useUser(id);

  const { group, userId } = useUserStore();
  const {
    data: postsData,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching: isPostsRefetching,
    hasNextPage,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
    error: postsError,
  } = useMemberPost(group?.id as string, id);

  const posts = postsData?.pages.flatMap((page) => page);

  const { width, height } = Dimensions.get("screen");

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const ListHeaderComponent = () => {
    return (
      <Box
        gap="m"
        alignItems="flex-start"
        paddingBottom="none"
        justifyContent="center"
        width="100%"
      >
        <UserInfo
          username={userData?.username!}
          name={userData?.name ? userData.name : ""}
          profilePhoto={userData?.profilePhoto ? userData.profilePhoto : ""}
          bio={userData?.bio ? userData.bio : ""}
          birthday={userData?.birthday ? userData.birthday : undefined}
        />
        <Text paddingBottom="s" variant="bodyLargeBold">
          Posts
        </Text>
      </Box>
    );
  };

  const EmptyListComponent = () => {
    return <Box>{userId === id ? <EmptyFeed /> : <EmptyDataDisplay />}</Box>;
  };

  const SuccessComponent = () => {
    return (
      <Box flex={1} width={width} height={height} paddingHorizontal="m" paddingTop="m">
        <MasonryFlashList
          data={posts || []}
          numColumns={2}
          ListHeaderComponent={<ListHeaderComponent />}
          ListEmptyComponent={<EmptyListComponent />}
          scrollEnabled={true}
          onEndReachedThreshold={0.7}
          onEndReached={loadMore}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          renderItem={({ item, index }) => (
            <Box
              width="100%"
              height="auto"
              padding="s"
              paddingRight={index % 2 === 0 ? "s" : "none"}
              paddingLeft={index % 2 !== 0 ? "s" : "none"}
            >
              <Photo
                image={item.media?.[0]?.url ?? ""}
                onPress={() => {
                  router.push(`/(app)/view-post/${item.id}`);
                }}
              />
            </Box>
          )}
          contentContainerStyle={{
            paddingBottom: 100,
            ...((!posts || posts.length === 0) && { minHeight: "100%" }),
          }}
        />
      </Box>
    );
  };

  const isLoading = isUserLoading || isPostsLoading;
  const isRefetching = isUserRefetching || isPostsRefetching;
  const error = userError || postsError;
  const errorMessage = error ? (userError ? userError.message : postsError?.message) : null;

  const state = {
    loading: isLoading || isRefetching,
    data: userData,
    error: errorMessage,
  };

  const handleRefresh = () => {
    refetchUser();
    refetchPosts();
  };

  return (
    <ResourceView
      resourceState={state}
      successComponent={<SuccessComponent />}
      loadingComponent={
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      }
      errorComponent={
        <Box padding="m" flex={1} justifyContent="center" alignItems="center">
          <ErrorDisplay refresh={handleRefresh} />
        </Box>
      }
    />
  );
};

export default User;
