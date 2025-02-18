import { NudgeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { getNotificationBody } from "../../utilities/nudge";
import { ExpoPushService } from "../../services/notification/expo";

export interface NudgeService {
  manualNudge(userIds: string[], groupId: string, managerId: string): Promise<void>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: ExpoPushService;

  constructor(nudgeTransaction: NudgeTransaction, expoService: ExpoPushService) {
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
}
