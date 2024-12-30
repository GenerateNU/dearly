import { Hono } from "hono";
import { getConfigurations } from "./config/config";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { seedWithRandomData } from "./database/seed";

const app = new Hono();

const config = getConfigurations();

(async function setUpServer() {
  try {
    const db = connectDB(config);

    await automigrateDB(db, config);

    await seedWithRandomData(db);

    configureMiddlewares(app, config);

    setUpRoutes(app, db);

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
