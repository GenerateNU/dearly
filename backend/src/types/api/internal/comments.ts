import { commentsTable } from "../../../entities/schema";
import { createSelectSchema } from "drizzle-zod";

export const commentValidate = createSelectSchema(commentsTable);

export type Comment = typeof commentsTable.$inferSelect;
