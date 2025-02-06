import { Context } from "hono";
import { NOTIFICATION } from "../../types/api/routes/members";
import { NotificationService } from "./service";
import { paginationSchema } from "../../utilities/pagination";
import { parseUUID } from "../../utilities/uuid";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";

export interface NotificationController {
  /**
   * Get notifications for a user, along with pre-signed urls.
   * @param payload - The user id and pagination details.
   */
  getNotifications(ctx: Context): Promise<NOTIFICATION>;
}

export class NotificationControllerImpl implements NotificationController {
  private notifService: NotificationService;

  constructor(service: NotificationService) {
    this.notifService = service;
  }

  async getNotifications(ctx: Context): Promise<NOTIFICATION> {
    const getNotifications = async () => {
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit, page });
      const id = parseUUID(ctx.get("userId"));
      const notifications = await this.notifService.getNotifications({ id, ...queryParams });
      return ctx.json(notifications, Status.OK);
    };

    return await handleAppError(getNotifications)(ctx);
  }
}
