import { Hono } from "hono";
import { getConfigurations } from "../../config/init";
import { connectDB } from "../../database/connect";
import { configureMiddlewares } from "../../middlewares/init";
import { setUpRoutes } from "../../routes/init";
import { automigrateDB } from "../../database/migrate";
import { resetDB } from "../../database/reset";
import { seedDatabase } from "./seed-db";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import Expo from "expo-server-sdk";
import { spyOn } from "bun:test";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { mockSchedulerClient } from "./mock";
import { SchedulerClient } from "@aws-sdk/client-scheduler";
import { initIntegration, initService } from "../../services/init";

export const expo = new Expo();
export const sendPushNotificationsAsyncSpy = spyOn(expo, "sendPushNotificationsAsync");
export const chunkPushNotificationsSpy = spyOn(expo, "chunkPushNotifications");

export const startTestApp = async (
  mockedSchedulerClient: SchedulerClient = mockSchedulerClient,
): Promise<Hono> => {
  const app = new Hono();

  const config = getConfigurations();

  // set up database for testing
  const db: PostgresJsDatabase = connectDB(config);
  await automigrateDB(db, config);
  await resetDB(db);
  await seedDatabase(db);

  // mock AWS EventBridge
  const schedulerClient = mockedSchedulerClient;

  // mock AWS S3
  const mockS3Client = mockClient(S3Client);
  const s3Client = mockS3Client.on(PutObjectCommand).resolves({}) as unknown as S3Client;

  // setup integrations and services
  const integrations = initIntegration(config, s3Client, expo, schedulerClient);
  const { mediaService, expoService, nudgeSchedulerService } = initService(
    integrations,
    db,
    config,
  );

  // setup app
  configureMiddlewares(app, config);
  setUpRoutes(app, db, config, {
    mediaService,
    expoService,
    nudgeSchedulerService,
  });

  return app;
};
