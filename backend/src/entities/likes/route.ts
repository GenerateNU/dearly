import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { LikeTransaction, LikeTransactionImpl } from "./transaction";
import { LikeService, LikeServiceImpl } from "./service";
import { LikeController, LikeControllerImpl } from "./controller";
import { IS3Operations } from "../../services/s3Service";

export const likeRoutes = (db: PostgresJsDatabase, s3ServiceProvider: IS3Operations): Hono => {
  const like = new Hono();

  const likeTransaction: LikeTransaction = new LikeTransactionImpl(db);
  const likeService: LikeService = new LikeServiceImpl(likeTransaction, s3ServiceProvider);
  const likeController: LikeController = new LikeControllerImpl(likeService);

  like.patch("/", (ctx) => likeController.toggleLike(ctx));
  like.get("/", (ctx) => likeController.getLikeUsers(ctx));

  return like;
};
