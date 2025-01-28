import { getAuthToken } from "@/utilities/device-token";

export const authWrapper =
  <T>() =>
  async (fn: (token: string) => Promise<T>) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authorization token is missing.");
    }
    return fn(token);
  };
