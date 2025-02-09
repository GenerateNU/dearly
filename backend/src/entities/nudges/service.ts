import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushMessage, Expo } from "expo-server-sdk";
import { NotificationMetadata } from "./validator";
import logger from "../../utilities/logger";
import { getNotificationBody } from "../../utilities/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import { AddNudgeSchedulePayload, NudgeSchedule } from "../../types/api/internal/nudges";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
  createSchedule(managerId: string, payload: AddNudgeSchedulePayload): Promise<NudgeSchedule | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: Expo;

  constructor(nudgeTransaction: NudgeTransaction, expoService: Expo) {
    this.nudgeTransaction = nudgeTransaction;
    this.expoService = expoService;
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

  async createSchedule(managerId: string, payload: AddNudgeSchedulePayload): Promise<NudgeSchedule | null> {
    const manualNudgeImpl = async () => {
      // Add schedule
      const schedule = await this.nudgeTransaction.createSchedule (
        managerId, 
        payload
      );

      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }
      
      // TODO: call the eventbridge scheduler to add the schedule

      return schedule;
    };

    return await handleServiceError(manualNudgeImpl)();
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
}
