import { getAuthToken } from "@/utilities/device-token";
import fetchClient from "./client";

const registerWrapper = <T>() => {
  return async (registerFn: (expoToken: string) => Promise<T>) => {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }
    return await registerFn(token);
  };
};

export const registerDeviceToken = async (expoToken: string): Promise<string | null> => {
  const req = async (token: string) => {
    await fetchClient.POST("/api/v1/users/devices", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: { expoToken: expoToken },
    });
    return expoToken;
  };
  return registerWrapper<string | null>()(req);
};

export const unregisterDeviceToken = async (expoToken: string): Promise<void | null> => {
  const req = async (token: string) => {
    await fetchClient.DELETE("/api/v1/users/devices", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: { expoToken: expoToken },
    });
  };
  return registerWrapper<void>()(req);
};
