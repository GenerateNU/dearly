import { mock, jest, spyOn } from "bun:test";
import { MOCK_SIGNED_URL } from "./test-constants";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  SchedulerClient,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { mockClient } from "aws-sdk-client-mock";

/**
 * This module provides mock implementations and spies for various external dependencies used in testing.
 *
 * It includes mocks for:
 * - AWS S3 presigned URL generation
 * - Supabase client
 * - Expo push notifications
 * - AWS EventBridge Scheduler
 *
 * The mocks are configured to provide predictable test behavior while maintaining type safety.
 * Spy functions are exported to allow verification of mock calls in tests.
 */

mock.module("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue(MOCK_SIGNED_URL),
  };
});

mock.module("@supabase/supabase-js", () => {
  return {
    SupabaseClient: jest.fn(),
    createClient: jest.fn(),
  };
});

mock.module("expo-server-sdk", () => {
  return {
    Expo: class {
      static isExpoPushToken = Expo.isExpoPushToken;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async sendPushNotificationsAsync(_: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
        return Promise.resolve([]);
      }

      async chunkPushNotifications(message: ExpoPushMessage[]): Promise<ExpoPushMessage[][]> {
        return Promise.resolve([message]);
      }
    },
  };
});

export const sendPushNotificationsAsyncSpy = spyOn(Expo.prototype, "sendPushNotificationsAsync");

export const getMockSchedulerClient = () => {
  const schedulerClient = mockClient(SchedulerClient);
  schedulerClient
    .on(CreateScheduleCommand)
    .resolves({ $metadata: { httpStatusCode: 200 }, ScheduleArn: "testARN" });
  schedulerClient.on(DeleteScheduleCommand).resolves({ $metadata: { httpStatusCode: 200 } });
  schedulerClient.on(GetScheduleCommand).resolves({});
  schedulerClient.on(UpdateScheduleCommand).resolves({ $metadata: { httpStatusCode: 200 } });
  const castSchedulerClient: SchedulerClient = schedulerClient as unknown as SchedulerClient;
  return castSchedulerClient;
};

export const mockSchedulerClient = getMockSchedulerClient();

export const scheduleCommandSpy = spyOn(mockSchedulerClient, "send");
