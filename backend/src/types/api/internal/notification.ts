import { notificationsTable } from "../../../entities/schema";

export type NotificationPlain = typeof notificationsTable.$inferSelect;

export type Notification = typeof notificationsTable.$inferSelect & {
  mediaURL: string | null;
};
