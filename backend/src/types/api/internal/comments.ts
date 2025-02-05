import { z } from "zod";
import { createCommentValidate } from "../../../entities/comments/validator";
import { commentsTable } from "../../../entities/schema";
import { PaginationParams } from "../../../utilities/pagination";

export type CreateCommentPayload = z.infer<typeof createCommentValidate> & {
  userId: string;
  postId: string;
};

export type Comment = typeof commentsTable.$inferSelect;

export type CommentPagination = PaginationParams & {
  postId: string;
  userId: string;
};
