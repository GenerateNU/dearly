import { API_BASE_URL } from "@/constants/api";
import { CreateUserPayload, User } from "@/types/user";
import { getAuthToken } from "@/utilities/device-token";

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to register user.");
    }

    return data;
}