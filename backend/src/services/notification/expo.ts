import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotificationData } from "../../types/api/internal/notification";

export interface PushNotificationService {
  sendPushNotifications(
    deviceTokens: string[],
    message: string,
    data: NotificationData,
  ): Promise<void>;
}

export class ExpoPushService implements PushNotificationService {
  private expo: Expo;

  constructor(expo: Expo) {
    this.expo = expo;
  }

  async sendPushNotifications(deviceTokens: string[], message: string, data?: NotificationData) {
    const messages = this.formatExpoPushMessage(deviceTokens, message, data);
    console.log(messages);
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
  }

  private formatExpoPushMessage(
    deviceTokens: string[],
    message: string,
    data?: NotificationData,
  ): ExpoPushMessage[] {
    return deviceTokens.map((token) => ({
      to: token,
      title: "✨ You got a new notification ✨",
      body: message,
      data,
      sound: "default",
    }));
  }
}
