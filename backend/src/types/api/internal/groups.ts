import { z } from "zod";
import { groupsTable } from "../../../entities/schema";
import { MIN_LIMIT, NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../../constants/database";
import {
  convertToDate,
  validateCalendarParam,
  validateYearMonth,
} from "../../../utilities/time/date";
import { paginationSchema } from "../../../utilities/api/pagination";

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
      .transform((val) => {
        if (!val) {
          return new Date();
        }
        const [year, month, day] = val.split("-").map(Number);

        const date = new Date(Date.UTC(year!, month! - 1, day!));
        return date;
      })
      .optional(),
    tmz: z.string().optional().default("America/New_York"),
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
      message: "Date must be in YYYY-MM format",
    })
    .transform(convertToDate)
    .optional()
    .default(() => {
      const now = new Date();
      return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    }),

  direction: z.enum(["before", "after", "both"]).optional().default("before"),
  tmzOffset: z
    .string()
    .transform((val) => {
      const parsed = Number(val);
      return parsed;
    })
    .optional()
    .default("240"),
  tmz: z.string().optional().default("America/New_York"),
});

export const updateGroupValidate = createGroupValidate.partial();

export type CreateGroupPayload = typeof groupsTable.$inferInsert;

export type UpdateGroupPayload = z.infer<typeof updateGroupValidate> & GroupIdPayload;

export type Group = typeof groupsTable.$inferSelect;

export type FeedParamPayload = z.infer<typeof feedParamValidate> & GroupUserIDPayload;

export type GroupUserIDPayload = {
  userId: string;
  groupId: string;
};

export type CalendarParamPayload = z.infer<typeof calendarParamsValidate> & GroupUserIDPayload;

export type DayWithObjectKey = {
  day: number;
  objectKey: string;
};

export type DayWithURL = {
  day: number;
  url: string;
};

export type ResponseWithDate<T> = {
  month: number;
  year: number;
  data: T[];
};

export type ThumbnailResponse = ResponseWithDate<DayWithObjectKey>;

export type ThumbnailResponseWithURL = ResponseWithDate<DayWithURL>;

export type GroupIdPayload = {
  userId: string;
  groupId: string;
};
