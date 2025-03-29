import { CreatePostPayload, Post } from "@/types/post";
import { useMutationBase } from "./base";
import { createPost } from "@/api/post";
import { useQueryPagination } from "./base";
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


export const useGroupFeed = (id: string, options: any = {}) => {
  return useQueryPagination<Post[]>(
    ["groups", id, "feed"],
    (page, limit) => {
      return getGroupFeed(id, page, limit) as Promise<Post[]>;
    },
    options,
    10,
  );
};
