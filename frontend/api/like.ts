import { LikePostUsers } from "@/types/post";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const toggleLike = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PATCH("/api/v1/posts/{id}/likes", {
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

export const getAllLikeUsers = async (
  id: string,
  limit?: number,
  page?: number,
): Promise<LikePostUsers> => {
  const req = async (token: string): Promise<LikePostUsers> => {
    const { data } = await fetchClient.GET("/api/v1/posts/{id}/likes", {
      headers: getHeaders(token),
      params: {
        path: {
          id: id,
        },
        query: {
          limit,
          page,
        },
      },
    });
    return data!;
  };
  return authWrapper<LikePostUsers>()(req);
};
