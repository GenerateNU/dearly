import { mock, jest, spyOn } from "bun:test";
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
      async sendPushNotificationsAsync(message: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
        return Promise.resolve([]);
      }
    },
  };
});

export const sendPushNotificationsAsyncSpy = spyOn(
  Expo.prototype,
  "sendPushNotificationsAsync",
);
