import { z } from "zod";
import { validate } from "uuid";
import {
  addFrequencyError,
  hasValidDaysOfWeek,
  hasValidMonthlyDay,
  hasValidYearlyDate,
  nudgeScheduleBase,
  validateFrequencyRequirements,
  validateYearlyMonthDay,
} from "../../utilities/nudge";

export const userIDValidate = z
  .object({
    users: z
      .array(
        z.string().refine((token) => validate(token), {
          message: "Invalid User IDs",
        }),
      )
      .min(1, {
        message: "Please select at least one user to nudge",
      }),
  })
  .passthrough();

export const nudgeScheduleValidate = nudgeScheduleBase
  .extend({
    frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).default("WEEKLY"),
    daysOfWeek: z
      .array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]))
      .optional()
      .nullable(),
    day: z.number().min(1).max(31).optional().nullable(),
    month: z.number().min(1).max(12).optional().nullable(),
    nudgeAt: z.preprocess(
      (time) => (typeof time === "string" ? new Date(time) : time),
      z.date()
    )
  })
  .refine(validateFrequencyRequirements, {
    message: "Invalid schedule configuration. Check frequency-specific requirements.",
  })
  .superRefine((data, ctx) => {
    switch (data.frequency) {
      case "DAILY":
        if (data.daysOfWeek || data.day || data.month) {
          addFrequencyError(ctx, data.frequency);
        }
        break;
      // weekly/biweekly: need day of weeks
      case "WEEKLY":
      case "BIWEEKLY":
        if (!hasValidDaysOfWeek(data)) {
          addFrequencyError(ctx, data.frequency);
        }
        break;
      // monthly: need day
      case "MONTHLY":
        if (!hasValidMonthlyDay(data)) {
          addFrequencyError(ctx, data.frequency);
        }
        break;
      // yearly: need month and day
      case "YEARLY":
        if (!hasValidYearlyDate(data)) {
          addFrequencyError(ctx, data.frequency);
        } else {
          validateYearlyMonthDay(data, ctx);
        }
        break;
    }
  });
