import { CreatePostPayload, Post } from "@/types/post";
import { useMutationBase, useQueryPaginationWithID } from "./base";
import { createPost } from "@/api/post";
import { getGroupFeed } from "@/api/group";
import { useUserStore } from "@/auth/store";

/**
 * Hook to create a new post
 *
 * @returns Mutation object for creating a post
 */
export const useCreatePost = (groupId: string) => {
  return useMutationBase<CreatePostPayload, Post>(
    (payload) => createPost(groupId, payload),
    ["groups", groupId],
  );
};

export const useGroupFeed = (options: any = {}) => {
  const { group } = useUserStore();
  return useQueryPaginationWithID<Post>(["users", "feed"], group.id, getGroupFeed, options, 10);
};
