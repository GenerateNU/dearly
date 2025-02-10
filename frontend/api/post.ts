import { CreatePostPayload, Post, UpdatePostPayload } from "@/types/post";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const createPost = async (id: string, payload: CreatePostPayload): Promise<Post> => {
  const req = async (token: string): Promise<Post> => {
    const { data } = await fetchClient.POST("/api/v1/groups/{id}/posts", {
      headers: getHeaders(token),
      body: payload,
      params: {
        path: {
          id,
        },
      },
    });
    return data!;
  };
  return authWrapper<Post>()(req);
};

export const getPost = async (id: string): Promise<Post> => {
  const req = async (token: string): Promise<Post> => {
    const { data } = await fetchClient.GET("/api/v1/posts/{id}", {
      headers: getHeaders(token),
      params: {
        path: {
          id: id,
        },
      },
    });
    return data!;
  };
  return authWrapper<Post>()(req);
};

export const updatePost = async (id: string, payload: UpdatePostPayload): Promise<Post> => {
  const req = async (token: string): Promise<Post> => {
    const { data } = await fetchClient.PATCH("/api/v1/posts/{id}", {
      headers: getHeaders(token),
      body: payload,
      params: {
        path: {
          id,
        },
      },
    });
    return data!;
  };
  return authWrapper<Post>()(req);
};

export const deletePost = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.DELETE("/api/v1/posts/{id}", {
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
