import { Hono } from "hono";
import { getConfigurations } from "./config/config";
import { connectDB } from "./database/connect";
import { configureMiddlewares } from "./middlewares/init";
import { setUpRoutes } from "./routes/init";
import { automigrateDB } from "./database/migrate";
import { S3Impl } from "./services/s3Service";
import Expo from "expo-server-sdk";
import { NotificationTransactionImpl } from "./services/notification/transaction";
import { ExpoPushService } from "./services/notification/expo";
import { ExpoNotificationService } from "./services/notification/service";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

const app = new Hono();
const config = getConfigurations();

(async function setUpServer() {
  const s3ServiceProvider = new S3Impl(config.s3Config);
  const expo = new Expo();
  const schedulerClient = new SchedulerClient();

  try {
    const db = connectDB(config);

    await automigrateDB(db, config);

    configureMiddlewares(app, config);

    const expoService = new ExpoPushService(expo);
    new ExpoNotificationService(config, new NotificationTransactionImpl(db), expoService);

    setUpRoutes(app, db, config, s3ServiceProvider, expoService, schedulerClient);

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
