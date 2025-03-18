import { toggleLike } from "@/api/like";
import { useMutationBase } from "./base";

/**
 * Hook to toggle the like of a given postId.
 *
 * @returns a mutation object for toggling the like.
 */
export const useToggleLike = (postId: string) => {
  return useMutationBase<void, void>(() => toggleLike(postId), ["posts", postId]);
};
