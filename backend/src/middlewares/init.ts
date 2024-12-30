import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./logger";
import { secureHeaders } from "hono/secure-headers";
import { isAuthorized } from "./auth";
import { compress } from "./compress";
import { Configuration } from "../types/config";

export const configureMiddlewares = (app: Hono, config: Configuration) => {
  app.use(cors(config.cors));
  if (config.environment !== "test") {
    app.use(logger);
  }
  app.use(secureHeaders());
  app.use(compress());
  app.use("/api/v1/*", isAuthorized(config.authorization.jwtSecretKey));
};
