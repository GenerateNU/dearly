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

export type FeedParamPayload = z.infer<typeof feedParamValidate> & {
  userId: string;
  groupId: string;
};
