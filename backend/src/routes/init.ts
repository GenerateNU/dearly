import { Configuration } from "./../types/config";
import { Context, Hono } from "hono";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userRoutes } from "../entities/users/route";
import { apiReference } from "@scalar/hono-api-reference";
import { getOpenAPISpecification } from "../utilities/docs";
import { HEALTHCHECK } from "../types/api/routes/healthcheck";
import { groupRoutes } from "../entities/groups/route";
import { postRoutes } from "../entities/posts/route";
import { IS3Operations } from "../services/s3Service";
import { MediaServiceImpl } from "../entities/media/service";
import { commentsRoutes } from "../entities/comments/route";
import { Expo } from "expo-server-sdk";
import { SlackController, SlackControllerImpl } from "./webhook";
import { mediaRoutes } from "../entities/media/route";
import { AWSEventBridgeScheduler } from "../services/nudgeScheduler";

export const setUpRoutes = (
  app: Hono,
  db: PostgresJsDatabase,
  config: Configuration,
  s3ServiceProvider: IS3Operations,
  scheduler: AWSEventBridgeScheduler,
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
  app.route("/api/v1", apiRoutes(db, s3ServiceProvider, scheduler));

  // unsupported route
  app.notFound((ctx: Context) => {
    return ctx.json({ error: "The requested route does not exist" }, 404);
  });
};

const apiRoutes = (
  db: PostgresJsDatabase,
  s3Service: IS3Operations,
  scheduler: AWSEventBridgeScheduler,
): Hono => {
  const api = new Hono();
  const mediaService = new MediaServiceImpl(db, s3Service);
  const expo = new Expo();

  api.route("/users", userRoutes(db, mediaService));
  api.route("/groups", groupRoutes(db, mediaService, expo, scheduler));
  api.route("/", postRoutes(db, mediaService));
  api.route("/", commentsRoutes(db, mediaService));
  api.route("/", mediaRoutes(mediaService));

  return api;
};
