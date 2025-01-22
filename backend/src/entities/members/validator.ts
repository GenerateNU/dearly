import { membersTable } from "../schema";
// import z from "zod";

export type addMemberPayload = {
  userId: string;
  groupId: string;
  role: "MEMBER" | "MANAGER";
}
export type Member = typeof membersTable.$inferSelect;
