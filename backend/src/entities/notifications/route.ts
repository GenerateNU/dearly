import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { MediaService } from "../media/service";
import { NotificationController, NotificationControllerImpl } from "./controller";
import { NotificationService, NotificationServiceImpl } from "./service";
import { NotificationTransactionImpl, NotificationTransactions } from "./transaction";

export const notificationRoutes = (db: PostgresJsDatabase, mediaService: MediaService): Hono => {
  const notification = new Hono();

  const notificationTransaction: NotificationTransactions = new NotificationTransactionImpl(db);
  const notificationService: NotificationService = new NotificationServiceImpl(notificationTransaction, mediaService);
  const notificationController: NotificationController = new NotificationControllerImpl(notificationService);

  notification.get("/notifications", (ctx) => notificationController.getNotifications(ctx));

  return notification;
};
