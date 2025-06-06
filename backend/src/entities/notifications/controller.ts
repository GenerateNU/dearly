import { Context } from "hono";
import { UserNotificationResponses } from "../../types/api/routes/users";
import { NotificationService } from "./service";
import { paginationSchema } from "../../utilities/api/pagination";
import { parseUUID } from "../../utilities/api/uuid";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";

/**
 * Interface for handling notification-related controller operations.
 * Provides methods for retrieving notifications for a user.
 */
export interface NotificationController {
  /**
   * Get notifications for a user, along with pre-signed urls.
   * @param payload - The user id and pagination details.
   */
  getNotifications(ctx: Context): Promise<UserNotificationResponses>;
}

export class NotificationControllerImpl implements NotificationController {
  private notifService: NotificationService;

  constructor(service: NotificationService) {
    this.notifService = service;
  }

  async getNotifications(ctx: Context): Promise<UserNotificationResponses> {
    const getNotifications = async () => {
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit: limit ?? 10, page: page ?? 1 });
      const receiverId = parseUUID(ctx.get("userId"));
      const notifications = await this.notifService.getNotifications({
        id: receiverId,
        ...queryParams,
      });
      return ctx.json(notifications, Status.OK);
    };
    return await handleAppError(getNotifications)(ctx);
  }
}
