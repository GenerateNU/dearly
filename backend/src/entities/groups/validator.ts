import { MIN_LIMIT, NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";
import { convertToDate, validateCalendarParam, validateYearMonth } from "../../utilities/date";
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
      .refine(validateYearMonth, {
        message: "Invalid date. Please follow the format YYYY-MM-DD.",
      })
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

  pivot: z
    .string()
    .refine((input) => validateCalendarParam(input), {
      message: "Date must be in YYYY-MM format and cannot be in future",
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
  date: number;
  url: string;
};
