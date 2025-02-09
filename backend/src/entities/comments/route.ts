import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { MediaService } from "../media/service";
import { CommentTransaction, CommentTransactionImpl } from "./transaction";
import { CommentController, CommentControllerImpl } from "./controller";
import { CommentService, CommentServiceImpl } from "./service";

export const commentsRoutes = (db: PostgresJsDatabase, mediaService: MediaService): Hono => {
  const comment = new Hono();

  const commentTransaction: CommentTransaction = new CommentTransactionImpl(db);
  const commentService: CommentService = new CommentServiceImpl(commentTransaction, mediaService);
  const commentController: CommentController = new CommentControllerImpl(commentService);

  comment.patch("/comments/:id/likes", (ctx) => commentController.toggleLikeComment(ctx));
  comment.post("/posts/:id/comments", (ctx) => commentController.createComment(ctx));
  comment.get("posts/:id/comments", (ctx) => commentController.getComments(ctx));
  comment.delete("comments/:id", (ctx) => commentController.deleteComment(ctx));
  return comment;
};
