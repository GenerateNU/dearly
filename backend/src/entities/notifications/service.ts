import { Pagination } from "../../types/api/internal/users";
import { NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { NotificationTransactions } from "./transaction";
import { Notification } from "../../types/api/internal/notification";

export interface NotificationService {
  /**
   * Get notifications for a user, along with pre-signed urls.
   * @param payload - The user id and pagination details.
   */
  getNotifications(payload: Pagination): Promise<Notification[]>;
}

export class NotificationServiceImpl implements NotificationService {
  private notifTransactions: NotificationTransactions;
  private mediaService: MediaService;

  constructor(notifTransactions: NotificationTransactions, mediaService: MediaService) {
    this.notifTransactions = notifTransactions;
    this.mediaService = mediaService;
  }
  async getNotifications(payload: Pagination): Promise<Notification[]> {
    const getNotificationsImpl = async () => {
      const notifs = await this.notifTransactions.getNotifications(payload, this.mediaService);
      if (!notifs) {
        throw new NotFoundError("Notifications");
      }
      return notifs;
    };
    return handleServiceError(getNotificationsImpl)();
  }
}
