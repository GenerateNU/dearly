import { usersTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { Expo } from "expo-server-sdk";
import { MIN_LIMIT } from "../../constants/database";
import { paginationSchema } from "../../utilities/pagination";

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
