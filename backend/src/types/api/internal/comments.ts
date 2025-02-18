import { z } from "zod";
import { createCommentValidate } from "../../../entities/comments/validator";
import { commentsTable } from "../../../entities/schema";
import { PaginationParams } from "../../../utilities/pagination";

export type CreateCommentPayload = z.infer<typeof createCommentValidate> & {
  userId: string;
  postId: string;
};

export const commentValidate = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  content: z.string().nullable(),
  voiceMemo: z.string().nullable(),
  createdAt: z.string(),
});

export type Comment = typeof commentsTable.$inferSelect;

export type CommentWithMetadata = Comment & {
  profilePhoto: string | null;
  username: string;
};

export type CommentPagination = PaginationParams & {
  postId: string;
  userId: string;
};
