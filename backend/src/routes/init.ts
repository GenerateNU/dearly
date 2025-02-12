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
import { SchedulerClient } from "@aws-sdk/client-scheduler";

export const setUpRoutes = (
  app: Hono,
  db: PostgresJsDatabase,
  s3ServiceProvider: IS3Operations,
  schedulerClient: SchedulerClient,
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

  app.route("/api/v1", apiRoutes(db, s3ServiceProvider, schedulerClient));

  // unsupported route
  app.notFound((ctx: Context) => {
    return ctx.json({ error: "The requested route does not exist" }, 404);
  });
};

const apiRoutes = (
  db: PostgresJsDatabase,
  s3Service: IS3Operations,
  schedulerClient: SchedulerClient,
): Hono => {
  const api = new Hono();
  const mediaService = new MediaServiceImpl(db, s3Service);
  const expo = new Expo();

  api.route("/users", userRoutes(db, mediaService));
  api.route("/groups", groupRoutes(db, mediaService, expo, schedulerClient));
  api.route("/", postRoutes(db, mediaService));
  api.route("/", commentsRoutes(db, mediaService));

  return api;
};
