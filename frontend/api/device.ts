import { API_BASE_URL } from "@/constants/api";
import { getAuthToken } from "@/utilities/device-token";

export const registerDeviceToken = async (expoToken: string): Promise<string> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/users/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expoToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to register device token.");
    }

    return expoToken;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during device token registration:", error.message);
    } else {
      console.error("An unknown error occurred during device token registration.");
    }
    throw error;
  }
};

export const unregisterDeviceToken = async (expoToken: string): Promise<void> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/users/devices`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expoToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to unregister device token.");
    }

    console.log("Device token unregistered successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during device token unregistration:", error.message);
    } else {
      console.error("An unknown error occurred during device token unregistration.");
    }
    throw error;
  }
};
