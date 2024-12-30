import { Context, Hono } from "hono";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userRoutes } from "../entities/users/route";
import { apiReference } from "@scalar/hono-api-reference";
import { getOpenAPISpecification } from "../utilities/docs";
import { HEALTHCHECK } from "../types/api/routes/healthcheck";

export const setUpRoutes = (app: Hono, db: PostgresJsDatabase) => {
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
    return ctx.json({ message: "OK" }, 200)
  });
  app.route("/api/v1", apiRoutes(db));
};

const apiRoutes = (db: PostgresJsDatabase): Hono => {
  const api = new Hono();
  api.route("/users", userRoutes(db));
  return api;
};
