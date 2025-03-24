import { z } from "zod";
import { likesTable } from "../../../entities/schema";

export const likeValidate = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  createdAt: z.string(),
});

export type Like = typeof likesTable.$inferSelect;
