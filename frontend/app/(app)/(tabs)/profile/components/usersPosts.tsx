import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import { Post } from "@/types/post";
import { MasonryList } from "@/design-system/components/posts/masonry";
import { useMemberPost } from "@/hooks/api/post";

const UserPosts = () => {
  const { userId, group } = useUserStore();

  const groupId = group && group.id ? group!.id : "";

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, refetch, error } =
    useMemberPost(group?.id as string, userId!);

  const posts = data?.pages.flatMap((page) => page);

  return (
    <Box width={"100%"} height={"auto"}>
      <Text variant="bodyLargeBold">Posts</Text>
      <MasonryList posts={posts} />
    </Box>
  );
};

export default UserPosts;
