import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./logger";
import { secureHeaders } from "hono/secure-headers";
import { isAuthorized } from "./auth";
import { compress } from "./compress";
import { Configuration } from "../types/config";
import { serveStatic } from "@hono/node-server/serve-static";
import { relative } from "node:path";
export const configureMiddlewares = (app: Hono, config: Configuration) => {

  const relativePathToScript = relative(process.cwd(), __dirname);
  console.log(relativePathToScript)
  app.use(cors(config.cors));
  if (config.environment !== "test") {
    app.use(logger);
    app.use(compress());
  }
  app.use(secureHeaders());
  app.use("/api/v1/*", isAuthorized(config.authorization.jwtSecretKey));
  app.use(
    "/apple-app-site-association",
    serveStatic({
      root: relativePathToScript, 
      onNotFound: (path, c) => {
        console.log(`${path} is not found, you access ${c.req.path}`);
      },
    }),
  );
};
