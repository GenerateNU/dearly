import { Hono } from "hono";
import { getConfigurations } from "./config/config";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { generateJWTFromID } from "./tests/helpers/test-token";
import S3Impl from "./services/s3Service";
import { s3 } from "bun";

const app = new Hono();

const config = getConfigurations();

(async function setUpServer() {
  const s3ServiceProvider = new S3Impl();
  try {
    const db = connectDB(config);

    console.log("JWT for manual testing:", generateJWTFromID(), "\n");

    await automigrateDB(db, config);

    configureMiddlewares(app, config);

    setUpRoutes(app, db, s3ServiceProvider);

    console.log("Successfully initialize app");
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1);
  }
})();

const server = {
  port: config.server.port,
  fetch: app.fetch,
};

export default server;
