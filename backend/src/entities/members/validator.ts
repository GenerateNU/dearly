import { membersTable } from "../schema";
import z from "zod";

export type CreateMemberPayload = typeof membersTable.$inferInsert;
export type Member = typeof membersTable.$inferSelect;

export const createMemberValidate = z
  .object({
    
  })
  .passthrough();
