import { groupsTable } from "../schema";
import z from "zod";

export type CreateGroupPayload = typeof groupsTable.$inferInsert;
export type Group = typeof groupsTable.$inferSelect;

export const createGroupValidate = z
  .object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .max(100, "Name must be at most 100 characters long"),
    description: z
      .string()
      .min(1, "Description must be at least 1 character long")
      .max(500, "Description must be at most 500 characters long")
      .optional(),
  })
  .passthrough();
