import { Hono } from "hono";
import { getConfigurations } from "./config/config";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { S3Impl } from "./services/s3Service";

const app = new Hono();

const config = getConfigurations();

(async function setUpServer() {
  const s3ServiceProvider = new S3Impl(config.s3Config);
  try {
    const db = connectDB(config);

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
