import { z } from "zod";
import { commentsTable } from "../../../entities/schema";
import { PaginationParams } from "../../../utilities/api/pagination";
import { MIN_LIMIT, TEXT_MAX_LIMIT } from "../../../constants/database";

export const createCommentValidate = z
  .object({
    content: z
      .string()
      .min(MIN_LIMIT, `Comment must be at least ${MIN_LIMIT} character long`)
      .max(TEXT_MAX_LIMIT, `Comment must be at most ${TEXT_MAX_LIMIT} characters long`)
      .optional(),
    voiceMemo: z.string().uuid().optional(),
  })
  .passthrough()
  .partial()
  .refine(
    (data) => (data.content || data.voiceMemo) && !(data.content && data.voiceMemo),
    "Either content or voiceMemo should be defined",
  );

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
