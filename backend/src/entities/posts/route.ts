import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { PostTransaction, PostTransactionImpl } from "./transaction";
import { PostService, PostServiceImpl } from "./service";
import { PostController, PostControllerImpl } from "./controller";
import { IS3Operations } from "../../services/s3Service";

export const postRoutes = (db: PostgresJsDatabase, s3ServiceProvider: IS3Operations): Hono => {
  const post = new Hono();

  const postTransaction: PostTransaction = new PostTransactionImpl(db);
  const postService: PostService = new PostServiceImpl(postTransaction, s3ServiceProvider);
  const postController: PostController = new PostControllerImpl(postService);

  post.post("/groups/:id/posts", (ctx) => postController.createPost(ctx));
  post.get("/posts/:id", (ctx) => postController.getPost(ctx));
  post.patch("/posts/:id", (ctx) => postController.updatePost(ctx));
  post.delete("/posts/:id", (ctx) => postController.deletePost(ctx));

  return post;
};
