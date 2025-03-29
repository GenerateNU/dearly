import Constants from "expo-constants";

// Check if hostUri is defined
if (!Constants.expoConfig?.hostUri && !Constants.expoConfig) {
  throw Error("Failed to load Expo Config");
}

export const API_BASE_URL = `https://8396-155-33-133-54.ngrok-free.app`;
