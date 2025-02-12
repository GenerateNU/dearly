import { createInsertSchema } from "drizzle-zod";
import { scheduledNudgesTable } from "../entities/schema";
import { z } from "zod";

const getNotificationBody = (groupName: string) => {
  return {
    title: "Time to Connect! 🚀",
    body: `✨ Share a post with your ${groupName} group now! ✨`,
  };
};

const getDaysInMonth = (month: number): number => {
  switch (month) {
    case 2: // February
      return 29; // Accounting for leap years
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      return 30;
    default:
      return 31;
  }
};

const nudgeScheduleBase = createInsertSchema(scheduledNudgesTable).omit({
  groupId: true,
  id: true,
});

type NudgeScheduleInput = z.input<typeof nudgeScheduleBase> & {
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  daysOfWeek?: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] | null;
  day?: number | null;
  month?: number | null;
};

const hasValidDaysOfWeek = (data: NudgeScheduleInput): boolean => Boolean(data.daysOfWeek?.length);

const hasValidMonthlyDay = (data: NudgeScheduleInput): boolean =>
  data.day !== undefined && data.day !== null;

const hasValidYearlyDate = (data: NudgeScheduleInput): boolean =>
  data.month !== undefined && data.month !== null && data.day !== undefined && data.day !== null;

const validateFrequencyRequirements = (data: NudgeScheduleInput): boolean => {
  switch (data.frequency) {
    case "DAILY":
      return !data.daysOfWeek && !data.day && !data.month;
    case "WEEKLY":
    case "BIWEEKLY":
      return hasValidDaysOfWeek(data);
    case "MONTHLY":
      return hasValidMonthlyDay(data);
    case "YEARLY":
      return hasValidYearlyDate(data);
    default:
      return false;
  }
};

const addFrequencyError = (ctx: z.RefinementCtx, frequency: string) => {
  const messages = {
    DAILY: "For DAILY schedules, no additional fields (daysOfWeek, day, month) should be specified",
    WEEKLY: "For WEEKLY/BIWEEKLY schedules, at least one day of the week must be selected",
    BIWEEKLY: "For WEEKLY/BIWEEKLY schedules, at least one day of the week must be selected",
    MONTHLY: "For MONTHLY schedules, a day of the month (1-31) must be specified",
    YEARLY: "For YEARLY schedules, both month (1-12) and day (1-31) must be specified",
  };

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: messages[frequency as keyof typeof messages],
  });
};

const validateYearlyMonthDay = (data: NudgeScheduleInput, ctx: z.RefinementCtx) => {
  if (data.month && data.day) {
    const maxDays = getDaysInMonth(data.month);
    if (data.day > maxDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid day for ${data.month}: must not be larger than ${maxDays}`,
      });
    }
  }
};

export {
  getNotificationBody,
  nudgeScheduleBase,
  hasValidDaysOfWeek,
  hasValidMonthlyDay,
  hasValidYearlyDate,
  getDaysInMonth,
  validateFrequencyRequirements,
  addFrequencyError,
  validateYearlyMonthDay,
};
