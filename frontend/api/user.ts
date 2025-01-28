import { CreateUserPayload, User } from "@/types/user";
import fetchClient from "./client";
import { authWrapper } from "./auth-wrapper";

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const req = async (token: string): Promise<User> => {
    const { data } = await fetchClient.POST("/api/v1/users", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    return data!;
  };
  return authWrapper<User>()(req);
};

export const getUser = async (id: string): Promise<User> => {
  const req = async (token: string): Promise<User> => {
    const { data } = await fetchClient.GET("/api/v1/users/{id}", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
