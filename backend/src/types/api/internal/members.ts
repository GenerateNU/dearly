import { membersTable } from "../../../entities/schema";
import { SearchedUser } from "./users";

export type AddMemberPayload = typeof membersTable.$inferInsert;
export type Member = typeof membersTable.$inferSelect;

export interface GroupMember {
    id: string;
    name: string;
    username: string;
    profilePhoto: string | null;
    role: string;
    notificationsEnabled: boolean;
    lastNudgedAt?: Date | null;
}