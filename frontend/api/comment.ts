import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";

export const toggleLikeComment = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PATCH("/api/v1/comments/{id}/likes", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};
