import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { ExpoPushService } from "../../services/notification/expo";
import { getNotificationBody } from "../../utilities/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import { NudgeSchedulePayload, NudgeSchedule } from "../../types/api/internal/nudges";
import { AWSEventBridgeScheduler, NudgeSchedulerService } from "../../services/nudgeScheduler";

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
      // check if in database already
      console.log(`Fetching old schedule...`)
      const prev_schedule = await this.nudgeTransaction.getNudgeSchedule(
        payload.groupId,
        managerId,
      );

      console.log(`Previous schedule: ${JSON.stringify(prev_schedule)}`)
      const toAdd = !prev_schedule;
      // upsert schedule into database
      const schedule = await this.nudgeTransaction.upsertSchedule(managerId, payload);
      if (!schedule) {
        throw new InternalServerError("Failed to add schedule");
      }

      console.log(`New scheduler: ${JSON.stringify(schedule)}`)

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
          console.log("adding scheduler...");
          try {
            response = await this.scheduler.addSchedule(schedule.id, schedulePayload);
          } catch (err) {
            console.log(`Error adding schedule: ${JSON.stringify(err)}`)
            const removedNudge = this.nudgeTransaction.deleteNudge(schedule.id, managerId);
            console.log(`Removed Nudge scheduler: ${JSON.stringify(removedNudge)}`)
          }
        } else {
          console.log("updating scheduler...");
          try {
            response = await this.scheduler.updateSchedule(schedule.id, schedulePayload);
          } catch (err) {
            console.log(`Error updating schedule: ${err}`)
            const previous = this.nudgeTransaction.upsertSchedule(managerId, schedule);
            console.log(`Previous Nudge schedule reverted: ${previous}`)
          }
        }
        console.log("done");
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
      console.log(`Retrieved schedule ${JSON.stringify(schedule)}`);
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
