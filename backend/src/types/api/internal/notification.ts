import { createSelectSchema } from "drizzle-zod";
import { notificationsTable } from "../../../entities/schema";

export const notificationValidate = createSelectSchema(notificationsTable);

export type Notification = typeof notificationsTable.$inferSelect;

export type partialNotification = {
  actorId: Notification["actorId"];
  receiverId: Notification["receiverId"];
  referenceType: Notification["referenceType"];
  groupId: Notification["groupId"];
  postId: Notification["postId"];
  title: Notification["title"];
  description: Notification["description"];
};
