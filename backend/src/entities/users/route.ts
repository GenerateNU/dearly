import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { UserTransaction, UserTransactionImpl } from "./transaction";
import { UserService, UserServiceImpl } from "./service";
import { UserController, UserControllerImpl } from "./controller";
import { MediaService } from "../media/service";
import { notificationRoutes } from "../notifications/route";

export const userRoutes = (db: PostgresJsDatabase, mediaService: MediaService): Hono => {
  const user = new Hono();

  const userTransaction: UserTransaction = new UserTransactionImpl(db);
  const userService: UserService = new UserServiceImpl(userTransaction, mediaService);
  const userController: UserController = new UserControllerImpl(userService);

  user.get("/groups", (ctx) => userController.getGroups(ctx));
  user.route("/", notificationRoutes(db, mediaService));
  user.get("/search", (ctx) => userController.searchByUsername(ctx));
  user.post("/", (ctx) => userController.createUser(ctx));
  user.get("/:id", (ctx) => userController.getUser(ctx));
  user.patch("/me", (ctx) => userController.updateUser(ctx));
  user.delete("/me", (ctx) => userController.deleteUser(ctx));
  user.post("/devices", (ctx) => userController.registerDevice(ctx));
  user.delete("/devices", (ctx) => userController.removeDevice(ctx));

  return user;
};
