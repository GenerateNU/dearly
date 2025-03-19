import * as Linking from "expo-linking";
import { Share } from "react-native";

export const showSharePopup = async (token: string | undefined) => {
  const url = Linking.createURL(`/(app)/(tabs)?token=${token}`);

  try {
    await Share.share({
      message: `Join my group on Dearly 💛: ${url}`,
    });
  } catch (error) {
    console.error("Error sharing link:", error);
  }
};
