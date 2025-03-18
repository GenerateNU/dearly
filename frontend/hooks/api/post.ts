import { CreatePostPayload, Post } from "@/types/post";
import { useMutationBase } from "./base";
import { createPost } from "@/api/post";

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
