import { createSelectSchema } from "drizzle-zod";
import { notificationsTable } from "../../../entities/schema";
import { Post } from "./posts";
import { Like } from "./like";
import { Comment } from "./comments";

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
  deviceTokens: string[];
  isEnabled: boolean;
};

export type NotificationData = Comment | Like | Post;

export type SendNotificationPayload = {
  deviceTokens: string[];
  message: string;
  title?: string;
  data?: NotificationData;
};

export type NotificationPlain = typeof notificationsTable.$inferSelect;

export type NotificationWithMedia = typeof notificationsTable.$inferSelect & {
  mediaURL: string | null;
};
