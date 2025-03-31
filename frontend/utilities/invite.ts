import { Share } from "react-native";

export const showSharePopup = async (token: string | undefined) => {
  const deeplink = process.env.EXPO_PUBLIC_API_BASE_URL;
  const url = deeplink + `group?token=${token}`;

  try {
    await Share.share({
      message: `Join my group on Dearly 💛: ${url}`,
    });
  } catch (error) {
    console.error("Error sharing link:", error);
  }
};
