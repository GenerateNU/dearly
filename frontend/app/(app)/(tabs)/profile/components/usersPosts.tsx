import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import { Post } from "@/types/post";
import { MasonryList } from "@/design-system/components/posts/masonry";
import { useGroupFeed } from "@/hooks/api/post";

const UserPosts = () => {
  const { userId, group } = useUserStore();

  const groupId = group && group.id ? group!.id : "";
  let userPosts: Post[] = [];
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch,
    isError,
    error,
  } = useGroupFeed(group?.id as string);

  if (!isLoading && !isError) {
    userPosts = data?.pages.flatMap((page) => page) || [];
    userPosts= [... userPosts, ... userPosts, ... userPosts, ... userPosts, ... userPosts, ... userPosts, ... userPosts ]
  }

  if (isError) {
    return <Text>{error.message}</Text>;
  }

  return (
    <Box width={"100%"} height={"auto"}>
      <Text variant="bodyLargeBold">Posts</Text>
      <MasonryList posts={userPosts} />
    </Box>
  );
};

export default UserPosts;
