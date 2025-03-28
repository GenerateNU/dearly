import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushService } from "../../services/notification/expo";
import { getNotificationBody } from "../../utilities/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import { NudgeSchedulePayload, NudgeSchedule } from "../../types/api/internal/nudges";
import { NudgeSchedulerService } from "../../services/nudgeScheduler";
import logger from "../../utilities/logger";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
  upsertSchedule(managerId: string, payload: NudgeSchedulePayload): Promise<NudgeSchedulePayload>;
  getSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: ExpoPushService;
  private scheduler: NudgeSchedulerService;

  constructor(
    nudgeTransaction: NudgeTransaction,
    expoService: ExpoPushService,
    scheduler: NudgeSchedulerService,
  ) {
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

      const { groupName, deviceTokens } = notificationMetadata;
      const message = getNotificationBody(groupName);

      await this.expoService.sendPushNotifications({
        deviceTokens,
        message: message.body,
        title: message.title,
      });
    };
    return await handleServiceError(manualNudgeImpl)();
  }

  async upsertSchedule(managerId: string, payload: NudgeSchedulePayload): Promise<NudgeSchedule> {
    const upsertScheduleImpl = async () => {
      // check if in the database already
      const prev_schedule = await this.nudgeTransaction.getNudgeSchedule(
        payload.groupId,
        managerId,
      );

      const toAdd = !prev_schedule;

      // upsert schedule into database
      const schedule = await this.nudgeTransaction.upsertSchedule(managerId, payload);
      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }

      const notificationMetadata = await this.nudgeTransaction.getAutoNudgeNotificationMetadata(
        schedule.groupId,
        managerId,
      );

      if (notificationMetadata.deviceTokens.length !== 0) {
        const { deviceTokens, groupName } = notificationMetadata;
        const { title, body } = getNotificationBody(groupName);
        const schedulePayload = {
          schedule: schedule,
          expo: {
            notifications: this.expoService.formatExpoPushMessage({
              deviceTokens,
              message: body,
              title,
            }),
          },
        };

        // Add to EventBridge Scheduler
        let response;
        if (toAdd) {
          try {
            response = await this.scheduler.addSchedule(schedule.groupId, schedulePayload);
          } catch (error) {
            logger.error(error);
            this.nudgeTransaction.deleteNudge(schedule.groupId, managerId);
          }
        } else {
          try {
            response = await this.scheduler.updateSchedule(schedule.groupId, schedulePayload);
          } catch (error) {
            logger.error(error);
            await this.nudgeTransaction.upsertSchedule(managerId, prev_schedule);
          }
        }
        if (response != 200) {
          throw new InternalServerError("Failed to add/update schedule in EventBridge");
        }
      }

      return schedule;
    };
    return await handleServiceError(upsertScheduleImpl)();
  }

  async getSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    const getScheduleImpl = async () => {
      const schedule = await this.nudgeTransaction.getNudgeSchedule(groupId, managerId);
      return schedule;
    };
    return await handleServiceError(getScheduleImpl)();
  }

  async deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    const deactivateNudgeImpl = async () => {
      const nudge = await this.nudgeTransaction.deactivateNudge(groupId, managerId);
      if (nudge) {
        await this.scheduler.disableSchedule(groupId);
      }
      return nudge;
    };
    return await handleServiceError(deactivateNudgeImpl)();
  }
}
