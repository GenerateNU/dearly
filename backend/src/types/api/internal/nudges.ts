import { scheduledNudgesTable } from "../../../entities/schema";

export type AddNudgeSchedulePayload = typeof scheduledNudgesTable.$inferInsert;
export type NudgeSchedule = typeof scheduledNudgesTable.$inferSelect;