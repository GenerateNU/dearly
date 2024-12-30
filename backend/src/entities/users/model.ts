import { usersTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export type CreateUserPayload = typeof usersTable.$inferInsert;
export type UpdateUserPayload = Partial<typeof usersTable.$inferInsert>;
export type User = typeof usersTable.$inferSelect;

export const createUserValidate = createInsertSchema(usersTable, {
  firstName: (schema) => schema.min(1),
  lastName: (schema) => schema.min(1),
}).omit({ id: true });

export const updateUserValidate = createUpdateSchema(usersTable, {
  firstName: (schema) => schema.min(1),
  lastName: (schema) => schema.min(1),
}).omit({ id: true });
