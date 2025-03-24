import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./logger";
import { secureHeaders } from "hono/secure-headers";
import { isAuthorized } from "./auth";
import { compress } from "./compress";
import { Configuration } from "../types/config";
import { serveStatic } from "@hono/node-server/serve-static";

/**
 * Configures and applies middlewares to the Hono application instance.
 *
 * This function sets up the necessary middlewares for various functionalities such as:
 * - CORS (Cross-Origin Resource Sharing)
 * - Logging HTTP requests
 * - Response compression
 * - Secure headers
 * - JWT-based authorization
 * - Serving static files (e.g., logo.svg)
 *
 * **How It Works:**
 * - The function first configures CORS with the provided configuration.
 * - If the environment is not 'test', it adds logging and compression middlewares.
 * - It ensures secure headers are added to all responses.
 * - The function applies JWT authorization to all `/api/v1/*` routes.
 * - It serves static files (e.g., `logo.svg`) from the `src/static` directory.
 *
 * **Parameters:**
 * - `app` (Hono): The Hono application instance to which the middlewares will be applied.
 * - `config` (Configuration): The configuration object that contains the necessary settings for CORS, environment, and JWT authorization.
 *
 * **Middlewares Applied:**
 * 1. **CORS**: Configured using the settings in the `config.cors` object.
 * 2. **Logger**: Logs HTTP request details like method, path, status, and duration, except in the 'test' environment.
 * 3. **Compression**: Compresses response bodies for large content (only if the environment is not 'test').
 * 4. **Secure Headers**: Adds security headers (e.g., CSP, X-Content-Type-Options) to all responses.
 * 5. **Authorization**: Enforces JWT-based authorization for all `/api/v1/*` routes using the provided `jwtSecretKey`.
 * 6. **Static File Serving**: Serves static files like `logo.svg` from the `src/static` directory.
 */
export const configureMiddlewares = (app: Hono, config: Configuration) => {
  app.use(cors(config.cors));
  if (config.environment !== "test") {
    app.use(logger);
    app.use(compress());
  }
  app.use(secureHeaders());
  app.use("/api/v1/*", isAuthorized(config.authorization.jwtSecretKey));
  app.use(
    "logo.svg",
    serveStatic({
      root: "src/static",
    }),
  );
};
