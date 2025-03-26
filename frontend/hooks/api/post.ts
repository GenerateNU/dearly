import { Comment, CreatePostPayload, Post } from "@/types/post";
import { useMutationBase, useQueryPagination } from "./base";
import { createPost } from "@/api/post";
import { useUserStore } from "@/auth/store";
import { getGroupFeed } from "@/api/group";
import { getComments } from "@/api/comment";

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
  return useQueryPagination<Post[]>(
    ["users", "feed"],
    (page, limit) => {
      return getGroupFeed(group.id, page, limit) as Promise<Post[]>;
    },
    options,
    10,
  );
};

export const useComments = (id: string, options: any = {}) => {
  return useQueryPagination<Comment[]>(
    ["users", "comments"],
    (page, limit) => {
      return getComments(id, page, limit) as Promise<Comment[]>;
    },
    options,
    10,
  );
};
