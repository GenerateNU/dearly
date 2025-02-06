import { createSelectSchema } from "drizzle-zod";
import { likesTable } from "../schema";

export const likeValidate = createSelectSchema(likesTable);

export type Like = typeof likesTable.$inferSelect;
