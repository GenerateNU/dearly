import { NudgeTransaction } from "./transaction";
import { UserIDsPayload } from "./validator";
import { handleServiceError } from "../../utilities/errors/service-error";
import Expo from "expo-server-sdk";

export interface NudgeService {
  manualNudge(userIds: UserIDsPayload): Promise<void>;
}

export class NudgeServiceImpl implements NudgeService {
  private nudgeTransaction: NudgeTransaction;
  private expoService: Expo;

  constructor(nudgeTransaction: NudgeTransaction, expoService: Expo) {
    this.nudgeTransaction = nudgeTransaction;
    this.expoService = expoService;
  }

  async manualNudge(userIds: UserIDsPayload): Promise<void> {
    const manualNudgeImpl = async () => {};
    return await handleServiceError(manualNudgeImpl)();
  }

  private async sendPushNotifications(): Promise<void> {
    this.expoService.sendPushNotificationsAsync([]);
  }

  private formatPushNotificationTicket(): string[] {
    return [];
  }
}
