import { scheduledNudgesTable } from "../../../entities/schema";

export type AddNudgeSchedulePayload = typeof scheduledNudgesTable.$inferInsert;
export type NudgeSchedule = typeof scheduledNudgesTable.$inferSelect;
export type NotificationMetadata = {
  deviceTokens: string[];
  groupId: string;
  groupName: string;
};

export type NudgeTarget = {
  userId: string;
  deviceToken: string;
};
