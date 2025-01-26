import { Context, Hono } from "hono";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userRoutes } from "../entities/users/route";
import { apiReference } from "@scalar/hono-api-reference";
import { getOpenAPISpecification } from "../utilities/docs";
import { HEALTHCHECK } from "../types/api/routes/healthcheck";
import { groupRoutes } from "../entities/groups/route";
import { postRoutes } from "../entities/posts/route";
import { likeRoutes } from "../entities/likes/route";
import { IS3Operations } from "../services/s3Service";

export const setUpRoutes = (
  app: Hono,
  db: PostgresJsDatabase,
  s3ServiceProvider: IS3Operations,
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

  app.route("/api/v1", apiRoutes(db, s3ServiceProvider));

  // unsupported route
  app.notFound((ctx: Context) => {
    return ctx.json({ error: "The requested route does not exist" }, 404);
  });
};

const apiRoutes = (db: PostgresJsDatabase, s3ServiceProvider: IS3Operations): Hono => {
  const api = new Hono();

  api.route("/users", userRoutes(db, s3ServiceProvider));
  api.route("/groups", groupRoutes(db, s3ServiceProvider));
  api.route("/", postRoutes(db, s3ServiceProvider));
  api.route("/posts/:id/likes", likeRoutes(db, s3ServiceProvider));

  return api;
};
