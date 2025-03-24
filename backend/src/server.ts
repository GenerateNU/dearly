import { Hono } from "hono";
import { getConfigurations } from "./config/init";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { initIntegration, initService } from "./services/init";
import { handleServerShuttingDown } from "./utilities/server/server";

const app = new Hono();
const config = getConfigurations();

(async function setUpServer() {
  try {
    // set up database
    const db = connectDB(config);
    await automigrateDB(db, config);

    // set up external integrations and services
    const integrations = initIntegration(config);

    const { pushNotificationService, mediaService, expoService, nudgeSchedulerService } =
      initService(integrations, db, config);

    pushNotificationService.subscribeToSupabaseRealtime();

    // set up app
    configureMiddlewares(app, config);

    setUpRoutes(app, db, config, {
      mediaService,
      expoService,
      nudgeSchedulerService,
    });

    // handle server shutting down
    handleServerShuttingDown(pushNotificationService);

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
