import { membersTable } from "../../../entities/schema";

export type AddMemberPayload = typeof membersTable.$inferInsert;
export type Member = typeof membersTable.$inferSelect;
