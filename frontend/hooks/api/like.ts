import { getAllLikeUsers, toggleLike } from "@/api/like";
import { useMutationBase, useQueryPagination } from "./base";
import { LikePostUsers } from "@/types/post";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to toggle the like of a given postId.
 *
 * @returns a mutation object for toggling the like.
 */
export const useToggleLike = (postId: string, groupId: string) => {
  const queryClient = useQueryClient();
  return useMutationBase<void, void>(
    () => toggleLike(postId),
    ["groups", groupId, "feed"],
    () => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
    },
  );
};

export const useGetAllLikeUsers = (postId: string, limit?: number, page?: number) => {
  return useQueryPagination<LikePostUsers>(["posts", postId, "likes"], () =>
    getAllLikeUsers(postId, limit, page),
  );
};
