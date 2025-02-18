import { z } from "zod";
import { ExpoPushMessage } from "expo-server-sdk";
import { scheduledNudgesTable } from "../../../entities/schema";
import { nudgeScheduleValidate } from "../../../entities/nudges/validator";

export type NudgeSchedule = typeof scheduledNudgesTable.$inferSelect;
export type NudgeSchedulePayload = z.infer<typeof nudgeScheduleValidate> & {
  groupId: string;
};
export type SchedulePayload = {
  schedule: NudgeSchedule;
  expo: {
    notifications: ExpoPushMessage[];
  };
};

export type NotificationMetadata = {
  deviceTokens: string[];
  groupId: string;
  groupName: string;
};

export type NudgeTarget = {
  userId: string;
  deviceToken: string;
};

type Range<
  Min extends number,
  Max extends number,
  Result extends number[] = [],
> = Result["length"] extends Max
  ? Result[number] // return all numbers in the range
  : Range<Min, Max, [...Result, Result["length"]]>;

// CronHourType (0-23)
export type CronHourType = Range<0, 24>;

// CronMinType (0-58)
export type CronMinType = Range<0, 60>;

// CronMonthType (0-11)
export type CronMonthType = Range<0, 12>;

// CronMonthDayType (0-31)
export type CronMonthDayType = Range<0, 31>;
