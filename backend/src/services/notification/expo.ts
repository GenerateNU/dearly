import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { SendNotificationPayload } from "../../types/api/internal/notification";

export interface PushNotificationService {
  sendPushNotifications(payload: SendNotificationPayload): Promise<void>;
  formatExpoPushMessage(payload: SendNotificationPayload): ExpoPushMessage[];
}

export class ExpoPushService implements PushNotificationService {
  private expo: Expo;

  constructor(expo: Expo) {
    this.expo = expo;
  }

  async sendPushNotifications({ deviceTokens, message, title, data }: SendNotificationPayload) {
    const messages = this.formatExpoPushMessage({ deviceTokens, message, title, data });
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
  }

  public formatExpoPushMessage({
    deviceTokens,
    message,
    title,
    data,
  }: SendNotificationPayload): ExpoPushMessage[] {
    return deviceTokens.map((token) => ({
      to: token,
      title: title ? title : "✨ You got a new notification ✨",
      body: message,
      data,
      sound: "default",
    }));
  }
}
