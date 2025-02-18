import { createSelectSchema } from "drizzle-zod";
import { likesTable } from "../schema";
import { z } from "zod";

export const likeValidate = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  createdAt: z.string(),
});

export type Like = typeof likesTable.$inferSelect;
