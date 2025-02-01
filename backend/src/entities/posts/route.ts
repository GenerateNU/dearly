import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { PostTransaction, PostTransactionImpl } from "./transaction";
import { PostService, PostServiceImpl } from "./service";
import { PostController, PostControllerImpl } from "./controller";
import { MediaService } from "../media/service";
import { likeRoutes } from "../likes/route";

export const postRoutes = (db: PostgresJsDatabase, mediaService: MediaService): Hono => {
  const post = new Hono();

  const postTransaction: PostTransaction = new PostTransactionImpl(db);
  const postService: PostService = new PostServiceImpl(postTransaction, mediaService);
  const postController: PostController = new PostControllerImpl(postService);

  post.post("/groups/:id/posts", (ctx) => postController.createPost(ctx));
  post.get("/posts/:id", (ctx) => postController.getPost(ctx));
  post.patch("/posts/:id", (ctx) => postController.updatePost(ctx));
  post.delete("/posts/:id", (ctx) => postController.deletePost(ctx));
  post.route("/posts/:id/likes", likeRoutes(db, mediaService));

  return post;
};
