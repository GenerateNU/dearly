import { NotificationService } from "../../services/notification/service";

export const handleServerShuttingDown = (notificationService: NotificationService) => {
  process.on("SIGINT", () => {
    console.log("SIGINT received: Shutting down...");
    notificationService.unsubscribeSupabaseRealtime();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received: Shutting down...");
    notificationService.unsubscribeSupabaseRealtime();
    process.exit(0);
  });
};
