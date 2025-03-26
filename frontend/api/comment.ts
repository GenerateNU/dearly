import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import { Comment, CreateCommentPayload } from "@/types/post";

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

export const getComments = async (
  id: string,
  limit?: number,
  page?: number,
): Promise<Comment[]> => {
  const req = async (token: string): Promise<Comment[]> => {
    const { data } = await fetchClient.GET("/api/v1/posts/{id}/comments", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
        query: {
          limit,
          page,
        },
      },
    });
    return data!;
  };
  return authWrapper<Comment[]>()(req);
};

export const postComment = async (id: string, payload: CreateCommentPayload): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.POST("/api/v1/posts/{id}/comments", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
      },
      body: payload,
    });
  };
  return authWrapper<void>()(req);
};

export const deleteComment = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.DELETE("/api/v1/comments/{id}", {
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
