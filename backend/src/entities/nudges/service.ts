import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { PushNotificationService } from "../../services/notification/expo";
import { getNotificationBody } from "../../utilities/time/nudge";
import { InternalServerError } from "../../utilities/errors/app-error";
import { NudgeSchedulePayload, NudgeSchedule } from "../../types/api/internal/nudges";
import { NudgeSchedulerService } from "../../services/nudgeScheduler";

/**
 * Interface defining the operations related to nudge functionality in the service layer.
 * Provides methods for managing manual and automated nudges, as well as nudge schedule management.
 */
export interface NudgeService {
  /**
   * Sends a manual nudge to specific users in a group.
   * @param userIds - Array of user IDs to be nudged
   * @param groupId - ID of the group where the nudge is being sent
   * @param managerId - ID of the manager sending the nudge
   * @returns Promise resolving to void
   */
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;

  /**
   * Creates or updates a nudge schedule for a group.
   * @param managerId - ID of the manager configuring the schedule
   * @param payload - Schedule configuration including group ID, frequency, and timing
   * @returns Promise resolving to the updated schedule payload
   */
  upsertSchedule(managerId: string, payload: NudgeSchedulePayload): Promise<NudgeSchedulePayload>;

  /**
   * Retrieves the current nudge schedule for a group.
   * @param groupId - ID of the group to get the schedule for
   * @param managerId - ID of the manager requesting the schedule
   * @returns Promise resolving to the schedule payload or null if no schedule exists
   */
  getSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;

  /**
   * Deactivates a nudge schedule for a group.
   * @param groupId - ID of the group to deactivate nudges for
   * @param managerId - ID of the manager deactivating the schedule
   * @returns Promise resolving to the deactivated schedule payload or null if no schedule exists
   */
  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: PushNotificationService;
  private scheduler: NudgeSchedulerService;

  constructor(
    nudgeTransaction: NudgeTransaction,
    expoService: PushNotificationService,
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
      const update = !(await this.nudgeTransaction.getNudgeSchedule(payload.groupId, managerId));
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
        if (update) {
          response = await this.scheduler.updateSchedule(managerId, schedulePayload);
        } else {
          response = await this.scheduler.addSchedule(managerId, schedulePayload);
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
      return await this.nudgeTransaction.getNudgeSchedule(groupId, managerId);
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
