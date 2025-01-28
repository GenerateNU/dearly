import { authWrapper } from "@/utilities/auth-token";
import fetchClient from "./client";

export const registerDeviceToken = async (expoToken: string): Promise<string> => {
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
  return authWrapper<string>()(req);
};

export const unregisterDeviceToken = async (expoToken: string): Promise<void> => {
  const req = async (token: string) => {
    await fetchClient.DELETE("/api/v1/users/devices", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: { expoToken: expoToken },
    });
  };
  return authWrapper<void>()(req);
};
