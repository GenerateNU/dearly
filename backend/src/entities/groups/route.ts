import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { GroupController, GroupControllerImpl } from "./controller";
import { GroupTransaction, GroupTransactionImpl } from "./transaction";
import { GroupService, GroupServiceImpl } from "./service";
import { IS3Operations } from "../../services/s3Service";

export const groupRoutes = (db: PostgresJsDatabase, s3ServiceProvider: IS3Operations): Hono => {
  const group = new Hono();

  const groupTransaction: GroupTransaction = new GroupTransactionImpl(db);
  const groupService: GroupService = new GroupServiceImpl(groupTransaction, s3ServiceProvider);
  const groupController: GroupController = new GroupControllerImpl(groupService);

  group.post("/", (ctx) => groupController.createGroup(ctx));
  group.get("/:id/feed", (ctx) => groupController.getAllPosts(ctx));
  group.get("/:id/calendar", (ctx) => groupController.getCalendar(ctx));
  group.delete("/:id", (ctx) => groupController.deleteGroup(ctx));
  group.get("/:id", (ctx) => groupController.getGroup(ctx));
  group.patch("/:id", (ctx) => groupController.updateGroup(ctx));

  return group;
};
