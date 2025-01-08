import { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { NOTIFICATION_TOKEN_KEY } from "@/constants/notification";
import { getExpoDeviceToken } from "@/utilities/device-token";
import { registerDeviceToken, unregisterDeviceToken } from "@/api/device";
import { useAuth } from "@/auth/provider";

/**
 * Registers or unregisters the device token for push notifications
 * based on the user's notification permissions and authentication state.
 */
const manageDeviceNotificationToken = async (isAuthenticated: boolean) => {
  try {
    const expoToken = await getExpoDeviceToken();

    if (!expoToken) {
      return;
    }

    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    const savedToken = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);

    if (isAuthenticated) {
      // if authenticated, register the device if not already registered
      if (currentStatus === "granted" && !savedToken) {
        const token = await registerDeviceToken(expoToken);
        console.log("Successfully registered for notifications");
        if (token) {
          await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
        }
      }
    } else {
      // if not authenticated, unregister the device if already registered
      if (savedToken) {
        await unregisterDeviceToken(expoToken);
        console.log("Successfully unregistered from notifications");
        await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error("Error handling notification permissions:", error);
  }
};

/**
 * Hook to handle notification permissions based on the user's authentication status or app state.
 * It listens for changes in authentication and app state to manage push notification token registration.
 */
export const useNotificationPermission = () => {
  const { isAuthenticated } = useAuth();

  // manage notification based on the authentication state
  const handleNotificationPermissions = useCallback(() => {
    const managePermissions = async () => {
      await manageDeviceNotificationToken(isAuthenticated);
    };

    managePermissions();
  }, [isAuthenticated]);

  // manage notification based on notification setting on user's device
  useEffect(() => {
    handleNotificationPermissions();

    const permissionSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationPermissions,
    );

    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleNotificationPermissions();
      }
    });

    return () => {
      permissionSubscription.remove();
      appStateSubscription.remove();
    };
  }, [isAuthenticated, handleNotificationPermissions]);
};
