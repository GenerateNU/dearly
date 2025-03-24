import { notificationsTable } from "../../../entities/schema";
import { Post } from "./posts";
import { Like } from "./like";
import { Comment } from "./comments";
import { IDPayload } from "./id";
import { z } from "zod";

export const notificationValidate = z
  .object({
    likeNotificationEnabled: z.boolean().optional(),
    commnentNotificationEnabled: z.boolean().optional(),
    nudgeNotificationEnabled: z.boolean().optional(),
    postNotificationEnabled: z.boolean().optional(),
  })
  .passthrough();

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
  groupId: string;
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
  mediaURL: string;
  profilePhoto?: string;
};

export type NotificationConfig = {
  likeNotificationEnabled?: boolean;
  commentNotificationEnabled?: boolean;
  nudgeNotificationEnabled?: boolean;
  postNotificationEnabled?: boolean;
};

export type NotificationConfigPayload = IDPayload & NotificationConfig;
