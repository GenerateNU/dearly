import { usersTable } from "../../../entities/schema";
import { PaginationParams } from "../../../utilities/pagination";

export interface SearchedUser {
  id: string;
  name: string;
  username: string;
  profilePhoto: string | null;
  isMember?: boolean;
  lastNudgedAt?: Date | null;
}

export interface SearchedInfo {
  groupId: string;
  username: string;
  limit: number;
  page: number;
  userId: string;
}

export type Pagination = PaginationParams & {
  id: string;
};

export type CreateUserPayload = typeof usersTable.$inferInsert;
export type UpdateUserPayload = Partial<typeof usersTable.$inferInsert>;
export type User = typeof usersTable.$inferSelect;
