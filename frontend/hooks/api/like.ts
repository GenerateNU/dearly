import { getAllLikeUsers, toggleLike } from "@/api/like";
import { useMutationBase, useQueryPagination } from "./base";
import { LikePostUsers } from "@/types/post";

/**
 * Hook to toggle the like of a given postId.
 *
 * @returns a mutation object for toggling the like.
 */
export const useToggleLike = (postId: string, groupId: string) => {
  return useMutationBase<void, void>(() => toggleLike(postId), ["groups", groupId, "feed"]);
};

export const useGetAllLikeUsers = (postId: string, limit?: number, page?: number) => {
  return useQueryPagination<LikePostUsers>(["posts", postId, "likes"], () =>
    getAllLikeUsers(postId, limit, page),
  );
};
