import { CreateUserPayload, UpdateUserPayload, User, UserGroups, UserPosts } from "@/types/user";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const req = async (token: string): Promise<User> => {
    const { data } = await fetchClient.POST("/api/v1/users", {
      headers: getHeaders(token),
      body: payload,
    });
    return data!;
  };
  return authWrapper<User>()(req);
};

export const getUser = async (id: string): Promise<User> => {
  const req = async (token: string): Promise<User> => {
    const { data } = await fetchClient.GET("/api/v1/users/{id}", {
      headers: getHeaders(token),
      params: {
        path: {
          id: id,
        },
      },
    });
    return data!;
  };
  return authWrapper<User>()(req);
};

export const updateUser = async (payload: UpdateUserPayload): Promise<User> => {
  const req = async (token: string): Promise<User> => {
    const { data } = await fetchClient.PATCH("/api/v1/users/me", {
      headers: getHeaders(token),
      body: payload,
    });
    return data!;
  };
  return authWrapper<User>()(req);
};

export const deleteUser = async (payload: UpdateUserPayload): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.DELETE("/api/v1/users/me", {
      headers: getHeaders(token),
    });
  };
  return authWrapper<void>()(req);
};

export const getUserGroups = async (limit: number, page: number): Promise<UserGroups> => {
  const req = async (token: string): Promise<UserGroups> => {
    const { data } = await fetchClient.GET("/api/v1/users/groups", {
      headers: getHeaders(token),
      params: {
        query: {
          limit,
          page,
        },
      },
    });
    return data!;
  };
  return authWrapper<UserGroups>()(req);
};

export const getUserPosts = async (limit: number, page: number): Promise<UserPosts> => {
  const req = async (token: string): Promise<UserPosts> => {
    const { data } = await fetchClient.GET("/api/v1/users/posts", {
      headers: getHeaders(token),
      params: {
        query: {
          limit,
          page,
        },
      },
    });
    return data!;
  };
  return authWrapper<UserPosts>()(req);
};
