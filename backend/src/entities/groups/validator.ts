import { MIN_LIMIT, NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";
import {
  convertToDate,
  validateDateFormat,
  validateFutureDate,
  validateMonth,
  validateYear,
} from "../../utilities/date";
import { paginationSchema } from "../../utilities/pagination";
import { groupsTable } from "../schema";
import z from "zod";

export type CreateGroupPayload = typeof groupsTable.$inferInsert;
export type Group = typeof groupsTable.$inferSelect;

export const createGroupValidate = z
  .object({
    name: z
      .string()
      .min(MIN_LIMIT, `Name must be at least ${MIN_LIMIT} character long`)
      .max(NAME_MAX_LIMIT, `Name must be at most ${NAME_MAX_LIMIT} characters long`),
    description: z
      .string()
      .min(MIN_LIMIT, `Description must be at least ${MIN_LIMIT} character long`)
      .max(TEXT_MAX_LIMIT, `Description must be at most ${TEXT_MAX_LIMIT} characters long`)
      .optional(),
  })
  .passthrough();

export const feedParamValidate = z
  .object({
    date: z
      .string()
      .refine(
        (val) => {
          if (/^-?\d+$/.test(val)) {
            return false;
          }

          const date = new Date(val);
          return (
            date instanceof Date &&
            !isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === val.slice(0, 10)
          );
        },
        {
          message: "Invalid date. Please follow the format YYYY-MM-DD.",
        },
      )
      .transform((val) => new Date(val))
      .optional(),
  })
  .merge(paginationSchema);

export const calendarParamsValidate = z.object({
  range: z
    .string()
    .transform((val) => {
      const parsed = Number(val);
      return parsed;
    })
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Range must be a positive number",
    })
    .optional()
    .default("1"),

  date: z
    .string()
    .refine(validateDateFormat, {
      message: "Date must be in YYYY-MM format (e.g., 2024-01)",
    })
    .refine(validateYear, {
      message: "Year must be a valid 4-digit number",
    })
    .refine(validateMonth, {
      message: "Month must be between 1 and 12",
    })
    .refine(validateFutureDate, {
      message: "Date cannot be in the future",
    })
    .transform(convertToDate)
    .optional()
    .default(() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }),
});

export type FeedParamPayload = z.infer<typeof feedParamValidate> & GroupUserIDPayload;

export type GroupUserIDPayload = {
  userId: string;
  groupId: string;
};

export type CalendarParamPayload = z.infer<typeof calendarParamsValidate> & GroupUserIDPayload;

export type ThumbnailResponse = {
  month: number;
  year: number;
  data: Thumbnail[];
};

export type Thumbnail = {
  date: Date;
  url: string;
};
