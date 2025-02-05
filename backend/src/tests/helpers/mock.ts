import { mock, jest } from "bun:test";
import { MOCK_SIGNED_URL } from "./test-constants";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

mock.module("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue(MOCK_SIGNED_URL),
  };
});

mock.module("expo-server-sdk", () => {
  return {
    Expo: class {
      static isExpoPushToken = Expo.isExpoPushToken;
      getPushNotificationReceiptsAsync = Expo.prototype.getPushNotificationReceiptsAsync;
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sendPushNotificationsAsync(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
        return Promise.resolve([]);
      }
    }
  };
});