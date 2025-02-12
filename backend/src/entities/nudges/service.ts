import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushMessage, Expo } from "expo-server-sdk";
import logger from "../../utilities/logger";
import { getNotificationBody } from "../../utilities/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import {
  AddNudgeSchedulePayload,
  NotificationMetadata,
  NudgeSchedule,
} from "../../types/api/internal/nudges";
import { NudgeScheduler } from "../../services/nudgeScheduler";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
  upsertSchedule(managerId: string, payload: AddNudgeSchedulePayload): Promise<NudgeSchedule>;
  getSchedule(groupId: string, managerId: string): Promise<NudgeSchedule | null>;
  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedule | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: Expo;
  private scheduler: NudgeScheduler;

  constructor(nudgeTransaction: NudgeTransaction, expoService: Expo, scheduler: NudgeScheduler) {
    this.nudgeTransaction = nudgeTransaction;
    this.expoService = expoService;
    this.scheduler = scheduler;
  }

  async manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void> {
    const manualNudgeImpl = async () => {
      const notificationMetadata = await this.nudgeTransaction.getManualNudgeNotificationMetadata(
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

  async upsertSchedule(
    managerId: string,
    payload: AddNudgeSchedulePayload,
  ): Promise<NudgeSchedule> {
    const manualNudgeImpl = async () => {
      // upsert schedule into database
      const schedule = await this.nudgeTransaction.upsertSchedule(managerId, payload);
      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }

      // format Expo push notification payload
      const notificationMetadata = await this.nudgeTransaction.getAutoNudgeNotificationMetadata(
        payload.groupId,
        managerId,
      );

      if (notificationMetadata.deviceTokens.length === 0) return;
      const expoPayload = this.formatPushNotifications(notificationMetadata);

      // TODO: mechanism to update schedule
      await this.scheduler.addSchedule(payload.groupId, expoPayload);

      return schedule;
    };
    // not sure why this is undefined, very strange
    return await handleServiceError(manualNudgeImpl)();
  }

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
