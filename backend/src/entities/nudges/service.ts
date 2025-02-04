import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotificationMetadata } from "./validator";
import logger from "../../utilities/logger";
import { getNotificationBody } from "../../utilities/nudge";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
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
      const notificationTickets = this.formatPushNotifications(notificationMetadata);
      await this.sendPushNotifications(notificationTickets);
    };
    return await handleServiceError(manualNudgeImpl)();
  }

  // TODO: refactor later with Nudge and Notification Service
  private async sendPushNotifications(notifications: ExpoPushMessage[]): Promise<void> {
    const receipts = await this.expoService.sendPushNotificationsAsync(notifications);
    const failedToSend = receipts.filter((receipt) => receipt.status === "error");
    if (failedToSend.length > 0) {
      logger.error(failedToSend);
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
