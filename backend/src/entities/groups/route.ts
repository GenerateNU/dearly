import { nudgeRoutes } from "./../nudges/route";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { GroupController, GroupControllerImpl } from "./controller";
import { GroupTransaction, GroupTransactionImpl } from "./transaction";
import { GroupService, GroupServiceImpl } from "./service";
import { MediaService } from "../media/service";
import { invitationRoutes } from "../invitations/route";
import { mediaRoutes } from "../media/route";
import { memberRoutes } from "../members/route";
import { Expo } from "expo-server-sdk";
import { SchedulerClient } from "@aws-sdk/client-scheduler"

export const groupRoutes = (
  db: PostgresJsDatabase,
  mediaService: MediaService,
  expo: Expo,
  scheduler: SchedulerClient
): Hono => {
  const group = new Hono();

  const groupTransaction: GroupTransaction = new GroupTransactionImpl(db);
  const groupService: GroupService = new GroupServiceImpl(groupTransaction, mediaService);
  const groupController: GroupController = new GroupControllerImpl(groupService);

  group.post("/", (ctx) => groupController.createGroup(ctx));
  group.get("/:id/feed", (ctx) => groupController.getAllPosts(ctx));
  group.get("/:id/calendar", (ctx) => groupController.getCalendar(ctx));
  group.delete("/:id", (ctx) => groupController.deleteGroup(ctx));
  group.get("/:id", (ctx) => groupController.getGroup(ctx));
  group.patch("/:id", (ctx) => groupController.updateGroup(ctx));
  group.route("/", invitationRoutes(db));
  group.route("/:id/media", mediaRoutes(mediaService));
  group.route("/:id/members", memberRoutes(db, mediaService));
  group.route("/:id/nudges", nudgeRoutes(db, expo, scheduler));

  return group;
};
