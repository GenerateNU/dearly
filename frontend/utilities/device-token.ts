import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

// get Expo push notification token
export const getExpoDeviceToken = async (): Promise<string | null> => {
  // check if the device is physical, push notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return null;
  }

  try {
    // setup notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // request permissions if not granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Push notification permission denied.");
        return null;
      }
    }

    // get the Expo push token
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    return expoPushToken;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return null;
  }
};
