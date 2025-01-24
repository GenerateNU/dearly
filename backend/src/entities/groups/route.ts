import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { GroupController, GroupControllerImpl } from "./controller";
import { GroupTransaction, GroupTransactionImpl } from "./transaction";
import { GroupService, GroupServiceImpl } from "./service";

export const groupRoutes = (db: PostgresJsDatabase): Hono => {
  const group = new Hono();

  const groupTransaction: GroupTransaction = new GroupTransactionImpl(db);
  const groupService: GroupService = new GroupServiceImpl(groupTransaction);
  const groupController: GroupController = new GroupControllerImpl(groupService);

  group.post("/", (ctx) => groupController.createGroup(ctx));
  group.delete("/:id", (ctx) => groupController.deleteGroup(ctx));
  group.get("/:id", (ctx) => groupController.getGroup(ctx));
  group.patch("/:id", (ctx) => groupController.updateGroup(ctx));

  return group;
};
