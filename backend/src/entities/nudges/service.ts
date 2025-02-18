import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushMessage, Expo } from "expo-server-sdk";
import logger from "../../utilities/logger";
import { getNotificationBody } from "../../utilities/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import {
  NudgeSchedulePayload,
  NotificationMetadata,
  NudgeSchedule,
  SchedulePayload,
} from "../../types/api/internal/nudges";
import { AWSEventBridgeScheduler } from "../../services/nudgeScheduler";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
  upsertSchedule(
    managerId: string,
    payload: NudgeSchedulePayload,
  ): Promise<NudgeSchedulePayload | undefined>;
  getSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: Expo;
  private scheduler: AWSEventBridgeScheduler;

  constructor(nudgeTransaction: NudgeTransaction, expoService: Expo, scheduler: SchedulerClient) {
    this.nudgeTransaction = nudgeTransaction;
    this.expoService = expoService;
    this.scheduler = new AWSEventBridgeScheduler(scheduler);
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
    payload: NudgeSchedulePayload,
  ): Promise<NudgeSchedule | undefined> {
    const upsertScheduleImpl = async () => {
      // check if in database already
      const update = !(await this.nudgeTransaction.getNudgeSchedule(payload.groupId, managerId)); // TODO: create own method to check existence
      // upsert schedule into database
      const schedule = await this.nudgeTransaction.upsertSchedule(managerId, payload);
      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }

      const notificationMetadata = await this.nudgeTransaction.getAutoNudgeNotificationMetadata(
        schedule.groupId,
        managerId,
      );

      if (notificationMetadata.deviceTokens.length === 0) return;

      const schedulePayload = {
        schedule: schedule,
        expo: {
          notifications: this.formatPushNotifications(notificationMetadata),
        },
      };

      // Add to EventBridge Scheduler
      let response;
      if (update) {
        response = await this.scheduler.updateSchedule(managerId, schedulePayload);
      } else {
        response = await this.scheduler.addSchedule(managerId, schedulePayload);
      }

      if (response != 200) {
        throw new InternalServerError("Failed to add/update schedule in EventBridge");
      }

      return schedule;
    };
    return await handleServiceError(upsertScheduleImpl)();
  }

  async getNotificationMetaData(
    managerId: string,
    schedule: NudgeSchedule,
  ): Promise<SchedulePayload | undefined> {
    const notificationMetadata = await this.nudgeTransaction.getAutoNudgeNotificationMetadata(
      schedule.groupId,
      managerId,
    );

    if (notificationMetadata.deviceTokens.length === 0) return;
    const schedulePayload = {
      schedule: schedule,
      expo: {
        notifications: this.formatPushNotifications(notificationMetadata),
      },
    };

    return schedulePayload;
  }

  async getSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    const getScheduleImpl = async () => {
      return await this.nudgeTransaction.getNudgeSchedule(groupId, managerId);
    };
    return handleServiceError(getScheduleImpl)();
  }

  async deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    const deactivateNudgeImpl = async () => {
      const nudge = await this.nudgeTransaction.deactivateNudge(groupId, managerId);
      if (nudge) {
        await this.scheduler.disableSchedule(groupId);
      }
      return nudge;
    };
    return handleServiceError(deactivateNudgeImpl)();
  }

  private async sendPushNotifications(notifications: ExpoPushMessage[]): Promise<void> {
    try {
      const chunks: ExpoPushMessage[][] =
        await this.expoService.chunkPushNotifications(notifications);
      for (const chunk of chunks) {
        const receipts = await this.expoService.sendPushNotificationsAsync(chunk);
        const failedToSend = receipts.filter((receipt) => receipt.status === "error");
        if (failedToSend.length > 0) {
          logger.error(failedToSend);
        }
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
    return deviceTokens.map((token) => ({
      to: token,
      data: {
        groupId,
        groupName,
      },
      ...getNotificationBody(groupName),
    }));
  }
}
