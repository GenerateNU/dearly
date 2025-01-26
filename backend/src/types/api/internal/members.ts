import { membersTable } from "../../../entities/schema";

export type AddMemberPayload = {
  userId: string;
  groupId: string;
  role: "MEMBER" | "MANAGER";
};

export type Member = typeof membersTable.$inferSelect;
