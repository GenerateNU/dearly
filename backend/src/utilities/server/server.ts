import { NotificationService } from "../../services/notification/service";

/**
 * Handles server shutdown notifications.
 *
 * @param notificationService - The notification service to unsubscribe from
 */
export const handleServerShuttingDown = (notificationService: NotificationService) => {
  process.on("SIGINT", () => {
    console.log("SIGINT received: Shutting down...");
    notificationService.unsubscribeSupabaseRealtime();
    process.exit(0);
  });
};
