import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { LikeTransaction, LikeTransactionImpl } from "./transaction";
import { LikeService, LikeServiceImpl } from "./service";
import { LikeController, LikeControllerImpl } from "./controller";

export const likeRoutes = (db: PostgresJsDatabase): Hono => {
  const like = new Hono();

  const likeTransaction: LikeTransaction = new LikeTransactionImpl(db);
  const likeService: LikeService = new LikeServiceImpl(likeTransaction);
  const likeController: LikeController = new LikeControllerImpl(likeService);

  like.patch("/", (ctx) => likeController.toggleLike(ctx));
  like.get("/", (ctx) => likeController.getLikeUsers(ctx));

  return like;
};
