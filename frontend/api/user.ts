import { CreateUserPayload, User } from "@/types/user";
import { getAuthToken } from "@/utilities/device-token";
import fetchClient from "./client";

/**
 * Wraps Client API Requests with authorizations
 */
const authWrapper = () => async (userFn: (token: string) => Promise<User>) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Authorization token is missing.");
  }
  return userFn(token);
};

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
  return authWrapper()(req);
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
  return authWrapper()(req);
};
