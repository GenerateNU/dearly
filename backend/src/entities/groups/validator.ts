import { MIN_LIMIT, NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";
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
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: "Invalid date format",
      }),
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
    .refine(
      (val) => {
        if (!val) return true;
        const dateRegex = /^\d{4}-(?:0[1-9]|1[0-2])$/;
        return dateRegex.test(val);
      },
      {
        message: "Date must be in YYYY-MM format (e.g., 2024-01)",
      },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const [year] = val.split("-").map(Number);
        return year !== undefined && !isNaN(year) && year.toString().length === 4;
      },
      {
        message: "Year must be a valid 4-digit number",
      },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const [, month] = val.split("-").map(Number);
        return month !== undefined && !isNaN(month) && month >= 1 && month <= 12;
      },
      {
        message: "Month must be between 1 and 12",
      },
    )
    .transform((val) => {
      if (!val) {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      }
      const [year, month] = val.split("-").map(Number);
      return `${year}-${String(month).padStart(2, "0")}`;
    })
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
  date: Date;
  url: string;
};
