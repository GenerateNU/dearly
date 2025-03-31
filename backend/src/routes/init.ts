import { Configuration } from "../types/config";
import { Context, Hono } from "hono";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userRoutes } from "../entities/users/route";
import { apiReference } from "@scalar/hono-api-reference";
import { getOpenAPISpecification } from "../utilities/server/docs";
import { HealthcheckResponse } from "../types/api/routes/healthcheck";
import { groupRoutes } from "../entities/groups/route";
import { postRoutes } from "../entities/posts/route";
import { MediaService } from "../entities/media/service";
import { commentsRoutes } from "../entities/comments/route";
import { SlackController, SlackControllerImpl } from "./webhook";
import { mediaRoutes } from "../entities/media/route";
import { PushNotificationService } from "../services/notification/expo";
import { AppService } from "../types/api/internal/services";
import { NudgeSchedulerService } from "../services/nudgeScheduler";
import { redirectPage } from "../utilities/server/redirect";
import { serveStatic } from "@hono/node-server/serve-static";
import { Status } from "../constants/http";

export const setUpRoutes = (
  app: Hono,
  db: PostgresJsDatabase,
  config: Configuration,
  services: AppService,
) => {
  setUpApiDocsRoute(app);

  setUpHealthcheckRoute(app);

  setUpSlackWebhookRoute(app, config);

  setUpApiV1Routes(app, db, services);

  setUpAppleAppSiteAssociationRoute(app);

  setUpGroupRedirectRoute(app);

  setUpNotFoundRoute(app);
};

// Set up the API documentation route
const setUpApiDocsRoute = (app: Hono) => {
  app.get(
    "/",
    apiReference({
      theme: "saturn",
      spec: {
        content: getOpenAPISpecification(),
      },
    }),
  );
};

// Set up the healthcheck route
const setUpHealthcheckRoute = (app: Hono) => {
  app.get("/healthcheck", (ctx: Context): HealthcheckResponse => {
    return ctx.json({ message: "OK" }, Status.OK);
  });
};

// Set up the Slack webhook route
const setUpSlackWebhookRoute = (app: Hono, config: Configuration) => {
  const slackController: SlackController = new SlackControllerImpl(config.slackConfig);
  app.post("/slack", (ctx: Context) => slackController.receiveBuildEvent(ctx));
};

// Set up version 1 API routes
const setUpApiV1Routes = (app: Hono, db: PostgresJsDatabase, services: AppService) => {
  const { expoService, mediaService, nudgeSchedulerService } = services;

  app.route("/api/v1", apiRoutes(db, mediaService, expoService, nudgeSchedulerService));
};

// Set up the Apple App Site Association static file route
const setUpAppleAppSiteAssociationRoute = (app: Hono) => {
  app.get(
    ".well-known/apple-app-site-association",
    async (c, next) => {
      await next();
      c.res.headers.set("Content-Type", "application/json");
      c.status(Status.OK);
    },
    serveStatic({
      root: "src/static",
    }),
  );
};

// Set up the group redirect route
const setUpGroupRedirectRoute = (app: Hono) => {
  app.get("/group", (c) => {
    return c.html(redirectPage());
  });
};

// Set up the 404 not found route
const setUpNotFoundRoute = (app: Hono) => {
  app.notFound((ctx: Context) => {
    return ctx.json({ error: "The requested route does not exist" }, 404);
  });
};

// Consolidate and group API routes
const apiRoutes = (
  db: PostgresJsDatabase,
  mediaService: MediaService,
  expoService: PushNotificationService,
  nudgeService: NudgeSchedulerService,
): Hono => {
  const api = new Hono();

  // Group the entity routes
  api.route("/users", userRoutes(db, mediaService));
  api.route("/groups", groupRoutes(db, mediaService, expoService, nudgeService));
  api.route("/", postRoutes(db, mediaService));
  api.route("/", commentsRoutes(db, mediaService));
  api.route("/", mediaRoutes(mediaService));

  return api;
};
