import { usersTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { Expo } from "expo-server-sdk";
import { MIN_LIMIT } from "../../constants/database";

export type CreateUserPayload = typeof usersTable.$inferInsert;
export type UpdateUserPayload = Partial<typeof usersTable.$inferInsert>;
export type User = typeof usersTable.$inferSelect;

export const createUserValidate = createInsertSchema(usersTable, {
  name: (schema) => schema.min(MIN_LIMIT),
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
