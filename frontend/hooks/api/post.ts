import { Comment, CreatePostPayload, CreateCommentPayload, Post } from "@/types/post";
import { useMutationBase, useQueryBase, useQueryPagination } from "./base";
import { createPost, getPost } from "@/api/post";
import { getComments } from "@/api/comment";
import { postComment } from "@/api/comment";
import { useQueryClient } from "@tanstack/react-query";
import { getGroupFeed } from "@/api/group";
import { getMemberPosts } from "@/api/member";

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

export const usePost = (id: string, options: any = {}) => {
  return useQueryBase<Post>(["posts", id], () => getPost(id), {
    enabled: !!id,
    ...options,
  });
};

export const useGroupFeed = (id: string, date?: string, options: any = {}) => {
  return useQueryPagination<Post[]>(
    ["groups", id, "feed"],
    (page, limit) => {
      return getGroupFeed(id, page, limit, date) as Promise<Post[]>;
    },
    options,
    10,
  );
};

export const useComments = (id: string) => {
  return useQueryPagination<Comment[]>(["posts", id, "comments"], (page, limit) => {
    return getComments(id, page, limit) as Promise<Comment[]>;
  });
};

export const useMemberPost = (id: string, userId: string, options: any = {}) => {
  return useQueryPagination<Post[]>(
    ["groups", id, "members", userId, "posts"],
    (page, limit) => {
      return getMemberPosts(id, userId, page, limit);
    },
    options,
    10,
  );
};

/**
 * Hook to create a new comment
 *
 * @returns Mutation object for creating a post
 */
export const useCreateComment = (postId: string, groupId: string) => {
  const queryClient = useQueryClient();

  return useMutationBase<CreateCommentPayload, void>(
    (payload) => postComment(postId, payload),
    ["posts", postId, "comments"],
    () => queryClient.invalidateQueries({ queryKey: ["groups", groupId, "feed"] }),
  );
};
