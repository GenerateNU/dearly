import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushMessage, Expo } from "expo-server-sdk";
import logger from "../../utilities/logger";
import { getNotificationBody } from "../../utilities/nudge";
import { BadRequestError, InternalServerError } from "../../utilities/errors/app-error";
import {
  AddNudgeSchedulePayload,
  NotificationMetadata,
  NudgeSchedule,
} from "../../types/api/internal/nudges";
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  ScheduleState,
} from "@aws-sdk/client-scheduler";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
  createSchedule(
    managerId: string,
    payload: AddNudgeSchedulePayload,
  ): Promise<NudgeSchedule | undefined>;
  getSchedule(groupId: string, managerId: string): Promise<NudgeSchedule | null>;
  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedule | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: Expo;
  private scheduler: SchedulerClient;

  constructor(nudgeTransaction: NudgeTransaction, expoService: Expo, scheduler: SchedulerClient) {
    this.nudgeTransaction = nudgeTransaction;
    this.expoService = expoService;
    this.scheduler = scheduler;
  }

  async manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void> {
    const manualNudgeImpl = async () => {
      const notificationMetadata = await this.nudgeTransaction.getNotificationMetadata(
        userIds,
        groupId,
        managerId,
      );
      if (notificationMetadata.deviceTokens.length === 0) return;
      const notificationTickets = this.formatPushNotifications(notificationMetadata);
      await this.sendPushNotifications(notificationTickets);
    };
    return await handleServiceError(manualNudgeImpl)();
  }

  async createSchedule(
    managerId: string,
    payload: AddNudgeSchedulePayload,
  ): Promise<NudgeSchedule | undefined> {
    const manualNudgeImpl = async () => {
      // Add schedule
      const schedule = await this.nudgeTransaction.createSchedule(managerId, payload);

      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }

      // Format EXPO Push payload
      const notificationMetadata = await this.nudgeTransaction.getNotificationMetadata(
        [], // TODO: getNotificationMetadata for all users.
        payload.groupId,
        managerId,
      );

      if (notificationMetadata.deviceTokens.length === 0) return;
      const expoPayload = this.formatPushNotifications(notificationMetadata);

      await this.createRecurringSchedule(payload.groupId, expoPayload);

      return schedule;
    };
    return await handleServiceError(manualNudgeImpl)();
  }

  private async createRecurringSchedule(
    name: string,
    expoPayload: ExpoPushMessage[],
  ): Promise<number | undefined> {
    const input = {
      // CreateScheduleInput
      Name: name, // required
      ScheduleExpression: "STRING_VALUE", // required
      ScheduleExpressionTimezone: "STRING_VALUE",
      State: ScheduleState.ENABLED,
      Target: {
        // Target
        Arn: "arn:aws:lambda:us-east-2:194722434714:function:SendNudgeNotification", // TODO: move into global constant
        RoleArn: "arn:aws:iam::194722434714:role/service-role/SendNudgeNotification-role-kypdggif", // required
        Input: JSON.stringify(expoPayload),
      },
      FlexibleTimeWindow: undefined,
    };

    try {
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to create a recurring schedule: ${err}`);
    }
  }

  // TODO: refactor later with Nudge and Notification Service
  private async sendPushNotifications(notifications: ExpoPushMessage[]): Promise<void> {
    try {
      const receipts = await this.expoService.sendPushNotificationsAsync(notifications);
      const failedToSend = receipts.filter((receipt) => receipt.status === "error");
      if (failedToSend.length > 0) {
        logger.error(failedToSend);
      }
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Failed to send nudge to users");
    }
  }

  private formatPushNotifications({
    deviceTokens,
    groupId,
    groupName,
  }: NotificationMetadata): ExpoPushMessage[] {
    return [
      {
        to: deviceTokens,
        data: {
          groupId,
          groupName,
        },
        ...getNotificationBody(groupName),
      },
    ];
  }

  async getSchedule(groupId: string, managerId: string): Promise<NudgeSchedule | null> {
    const getScheduleImpl = async () => {
      return await this.nudgeTransaction.getNudgeSchedule(groupId, managerId);
    };
    return handleServiceError(getScheduleImpl)();
  }

  async deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedule | null> {
    const deactivateNudgeImpl = async () => {
      return await this.nudgeTransaction.deactivateNudge(groupId, managerId);
    };
    return handleServiceError(deactivateNudgeImpl)();
  }
}
