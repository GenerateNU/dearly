import { groupsTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { Expo } from "expo-server-sdk";

export type CreateGroupPayLoad = typeof groupsTable.$inferInsert;
export type Group = typeof groupsTable.$inferSelect;

export const createGroupValidate = createInsertSchema(groupsTable, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
}).omit({ id: true, managerId: true });

export const expoTokenValidate = z.object({
  expoToken: z.string().refine((token) => Expo.isExpoPushToken(token), {
    message: "Invalid Expo Push Token",
  }),
});
