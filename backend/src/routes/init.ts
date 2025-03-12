import { Configuration } from "./../types/config";
import { Context, Hono } from "hono";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userRoutes } from "../entities/users/route";
import { apiReference } from "@scalar/hono-api-reference";
import { getOpenAPISpecification } from "../utilities/docs";
import { HEALTHCHECK } from "../types/api/routes/healthcheck";
import { groupRoutes } from "../entities/groups/route";
import { postRoutes } from "../entities/posts/route";
import { MediaService } from "../entities/media/service";
import { commentsRoutes } from "../entities/comments/route";
import { SlackController, SlackControllerImpl } from "./webhook";
import { mediaRoutes } from "../entities/media/route";
import { ExpoPushService } from "../services/notification/expo";
import { AppService } from "../types/api/internal/services";
import { NudgeSchedulerService } from "../services/nudgeScheduler";
import { serveStatic } from "@hono/node-server/serve-static";

export const setUpRoutes = (
  app: Hono,
  db: PostgresJsDatabase,
  config: Configuration,
  services: AppService,
) => {
  // api documentation
  app.get(
    "/",
    apiReference({
      theme: "saturn",
      spec: {
        content: getOpenAPISpecification(),
      },
    }),
  );

  app.get("/healthcheck", (ctx: Context): HEALTHCHECK => {
    return ctx.json({ message: "OK" }, 200);
  });

  // webhook to send to slack channel for CI message
  const slackController: SlackController = new SlackControllerImpl(config.slackConfig);
  app.post("/slack", (ctx: Context) => slackController.receiveBuildEvent(ctx));

  // initialize routes
  const { expoService, mediaService, nudgeSchedulerService } = services;
  app.route("/api/v1", apiRoutes(db, mediaService, expoService, nudgeSchedulerService));

  app.get(
    ".well-known/apple-app-site-association",
    serveStatic({
      path: "../.well-known/apple-app-site-association",
    }),
  );

  // unsupported route
  app.notFound((ctx: Context) => {
    return ctx.json({ error: "The requested route does not exist" }, 404);
  });
};

const apiRoutes = (
  db: PostgresJsDatabase,
  mediaService: MediaService,
  expoService: ExpoPushService,
  nudgeService: NudgeSchedulerService,
): Hono => {
  const api = new Hono();

  api.route("/users", userRoutes(db, mediaService));
  api.route("/groups", groupRoutes(db, mediaService, expoService, nudgeService));
  api.route("/", postRoutes(db, mediaService));
  api.route("/", commentsRoutes(db, mediaService));
  api.route("/", mediaRoutes(mediaService));

  return api;
};
