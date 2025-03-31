import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { usersTable } from "../../../entities/schema";
import { PaginationParams, paginationSchema } from "../../../utilities/api/pagination";
import { MIN_LIMIT } from "../../../constants/database";
import { z } from "zod";
import Expo from "expo-server-sdk";

export const createUserValidate = createInsertSchema(usersTable, {
  username: (schema) => schema.min(MIN_LIMIT),
}).omit({ id: true });

export const updateUserValidate = createUpdateSchema(usersTable, {
  name: (schema) => schema.min(MIN_LIMIT),
  username: (schema) => schema.min(MIN_LIMIT),
}).omit({ id: true });

export const expoTokenValidate = z.object({
  expoToken: z.string().refine((token) => Expo.isExpoPushToken(token), {
    message: "Invalid Expo Push Token",
  }),
});

export const querySchema = z
  .object({
    username: z.string(),
    groupId: z.string().uuid({ message: "Invalid ID format" }),
  })
  .merge(paginationSchema);

export interface SearchedUser {
  id: string;
  name: string;
  username: string;
  profilePhoto?: string | null;
  lastNudgedAt?: Date | null;
  role?: "MEMBER" | "MANAGER" | null;
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
