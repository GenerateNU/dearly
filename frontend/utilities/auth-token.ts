import AsyncStorage from "@react-native-async-storage/async-storage";

export const getHeaders = (token: string, contentType: string = "application/json") => {
  return {
    "Content-Type": contentType,
    Authorization: `Bearer ${token}`,
  };
};

export const authWrapper =
  <T>() =>
  async (fn: (token: string) => Promise<T>) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authorization token is missing.");
    }
    return fn(token);
  };

// retrieve JWT token from local storage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Get all keys and find the Supabase auth token key
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseTokenKey = allKeys.find(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    );

    if (!supabaseTokenKey) {
      return null;
    }

    const tokenString = await AsyncStorage.getItem(supabaseTokenKey);
    if (!tokenString) return null;

    const parsedToken = JSON.parse(tokenString);
    return parsedToken?.access_token ?? null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};
