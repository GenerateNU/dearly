import { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { NOTIFICATION_TOKEN_KEY } from "@/constants/notification";
import { getExpoDeviceToken } from "@/utilities/device-token";
import { registerDeviceToken, unregisterDeviceToken } from "@/api/device";
import { useAuth } from "@/auth/provider";

// responsible for registering and unregistering notification
// register if has not been registered, and unregistered when has not been unregistered
const notificationRegisterHandler = async () => {
  try {
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    const savedToken = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    const expoToken = await getExpoDeviceToken();

    if (!expoToken) {
      return;
    }

    if (currentStatus === "granted") {
      if (!savedToken) {
        const token = await registerDeviceToken(expoToken);
        console.log("Successfully registered for notification");
        if (token) {
          await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
        }
      } else {
      }
    } else {
      if (savedToken) {
        await unregisterDeviceToken(expoToken);
        console.log("Successfully unregistered for notification");
        await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error("Error handling notification permissions:", error);
  }
}

// handle whole app notification permission
export const useNotificationPermission = () => {
  const { isAuthenticated } = useAuth();

  // manage notification if auth state changes (login, signup, logout)
  const handleNotificationPermissions = useCallback(async () => {
    notificationRegisterHandler();
  }, [isAuthenticated]);

  // manage notification by listening to device's notification settings
  useEffect(() => {
    if (isAuthenticated) {
      handleNotificationPermissions();

      const permissionSubscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationPermissions,
      );

      const checkPermissionStatus = async () => {
        handleNotificationPermissions();
      };

      const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
        if (nextAppState === "active") {
          checkPermissionStatus();
        }
      });

      return () => {
        permissionSubscription.remove();
        appStateSubscription.remove();
      };
    }
  }, [isAuthenticated, handleNotificationPermissions]);
};
