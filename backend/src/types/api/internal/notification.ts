import { createSelectSchema } from "drizzle-zod";
import { notificationsTable } from "../../../entities/schema";

export const notificationValidate = createSelectSchema(notificationsTable);

export type Notification = typeof notificationsTable.$inferInsert;

export type partialNotification = {
  actorId: Notification["actorId"];
  receiverId: Notification["receiverId"];
  referenceType: Notification["referenceType"];
  groupId: Notification["groupId"];
  postId: Notification["postId"];
  title: Notification["title"];
  description: Notification["description"];
};

export type PostNotificationMetadata = {
  username: string;
  groupName: string;
  memberIDs: string[];
  deviceTokens: string[];
};

export type LikeCommentNotificationMetadata = {
  userId: string;
  username: string;
  groupName: string;
  token: string[];
  isEnabled: boolean;
};
