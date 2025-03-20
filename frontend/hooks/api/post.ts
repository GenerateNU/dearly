import { CreatePostPayload, Post } from "@/types/post";
import { useMutationBase, useQueryPagination } from "./base";
import { createPost } from "@/api/post";
import { useUserStore } from "@/auth/store";
import { getGroupFeed } from "@/api/group";

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
  if (!group) {
    throw new Error("Group not found");
  }

  return useQueryPagination<Post[]>(
    ["users", "feed"],
    (page, limit) => {
      if (!group.id) {
        throw new Error("Group ID is undefined");
      }
      return getGroupFeed(group.id, page, limit) as Promise<Post[]>;
    },
    options,
    10,
  );
};
