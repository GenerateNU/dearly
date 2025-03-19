import { membersTable } from "../../../entities/schema";

export type AddMemberPayload = typeof membersTable.$inferInsert;
export type Member = typeof membersTable.$inferSelect;

export interface GroupMember {
  id: string;
  name: string;
  username: string;
  profilePhoto: string | null;
  role: string;
  lastNudgedAt?: Date | null;
}
