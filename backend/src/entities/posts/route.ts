import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { PostTransaction, PostTransactionImpl } from "./transaction";
import { PostService, PostServiceImpl } from "./service";
import { PostController, PostControllerImpl } from "./controller";
import { CheckMemberTransaction, CheckMemberTransactionImpl } from "./role-transaction";

export const postRoutes = (db: PostgresJsDatabase): Hono => {
  const post = new Hono();

  const postTransaction: PostTransaction = new PostTransactionImpl(db);
  const checkMemberTransaction: CheckMemberTransaction = new CheckMemberTransactionImpl(db);
  const postService: PostService = new PostServiceImpl({
    postTransaction,
    checkMemberTransaction,
  });
  const postController: PostController = new PostControllerImpl(postService);

  post.post("/", (ctx) => postController.createPost(ctx));
  post.get("/:postId", (ctx) => postController.getPost(ctx));
  post.patch("/", (ctx) => postController.updatePost(ctx));
  post.delete("/:postId", (ctx) => postController.deletePost(ctx));

  return post;
};
