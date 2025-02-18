import { z } from "zod";

export const likeValidate = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  createdAt: z.string(),
});
