import { API_BASE_URL } from "@/constants/api";
import { CreateUserPayload, User } from "@/types/user";
import { getAuthToken } from "@/utilities/device-token";
import { handleHTTPStatusError, handleNetworkError } from "@/utilities/errors";
import { fetchClient } from "./client";

export const createUser = async (payload: CreateUserPayload): Promise<User> => {

  const token = await getAuthToken();

  if (!token) {
    throw new Error("Authorization token is missing.");
  }

  const { data, error, response } = await fetchClient.POST("/api/v1/users", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: payload
  })

  if (response.ok && data) {
    return data;
  } else {
    return handleHTTPStatusError(response.status, error);
  }

};

export const getUser = async (id: string): Promise<User> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Authorization token is missing.");
    }

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      return handleHTTPStatusError(response.status, data);
    }
  } catch (error) {
    return handleNetworkError(error);
  }
};
