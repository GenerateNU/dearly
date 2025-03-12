import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./logger";
import { secureHeaders } from "hono/secure-headers";
import { isAuthorized } from "./auth";
import { compress } from "./compress";
import { Configuration } from "../types/config";
import { serveStatic } from "@hono/node-server/serve-static";

export const configureMiddlewares = (app: Hono, config: Configuration) => {
  app.use(cors(config.cors));
  if (config.environment !== "test") {
    app.use(logger);
    app.use(compress());
  }
  app.use(secureHeaders());
  app.use("/api/v1/*", isAuthorized(config.authorization.jwtSecretKey));
  app.use(
    ".well-known/apple-app-site-association",
    serveStatic({
      root: "src/",
      onNotFound: (path, c) => {
        console.log(`${path} is not found, you access ${c.req.path}`);
      },
    }),
  );
};
