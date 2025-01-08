import Constants from "expo-constants";

// Check if hostUri is defined
if (!Constants.expoConfig?.hostUri && !Constants.expoConfig) {
  throw Error("Failed to load Expo Config");
}

export const API_BASE_URL = `http://${Constants.expoConfig.hostUri?.split(":").shift() || "localhost"}:3000/api/v1`;
