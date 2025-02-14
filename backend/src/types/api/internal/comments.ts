import { z } from "zod";
import { createCommentValidate } from "../../../entities/comments/validator";
import { commentsTable } from "../../../entities/schema";
import { PaginationParams } from "../../../utilities/pagination";
import { createSelectSchema } from "drizzle-zod";

export type CreateCommentPayload = z.infer<typeof createCommentValidate> & {
  userId: string;
  postId: string;
};

export const commentValidate = createSelectSchema(commentsTable);

export type Comment = typeof commentsTable.$inferSelect;

export type CommentWithMetadata = Comment & {
  profilePhoto: string | null;
  username: string;
};

export type CommentPagination = PaginationParams & {
  postId: string;
  userId: string;
};
