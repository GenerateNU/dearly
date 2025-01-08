import { API_BASE_URL } from "@/constants/api";
import { CreateUserPayload, User } from "@/types/user";
import { getAuthToken } from "@/utilities/device-token";
import { handleHTTPStatusError, handleNetworkError } from "@/utilities/errors";

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Authorization token is missing.");
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
