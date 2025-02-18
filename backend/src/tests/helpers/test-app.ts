import { Hono } from "hono";
import { getConfigurations } from "../../config/config";
import { connectDB } from "../../database/connect";
import { configureMiddlewares } from "../../middlewares/init";
import { setUpRoutes } from "../../routes/init";
import { automigrateDB } from "../../database/migrate";
import { resetDB } from "../../database/reset";
import { seedDatabase } from "./seed-db";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { S3Impl } from "../../services/s3Service";
import Expo from "expo-server-sdk";
import { spyOn } from "bun:test";

export const expo = new Expo();
export const sendPushNotificationsAsyncSpy = spyOn(expo, "sendPushNotificationsAsync");
export const chunkPushNotificationsSpy = spyOn(expo, "chunkPushNotifications");
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ExpoPushService } from "../../services/notification/expo";

export const startTestApp = async (): Promise<Hono> => {
  const app = new Hono();

  const config = getConfigurations();

  const mockS3Client = mockClient(S3Client);
  const client = mockS3Client.on(PutObjectCommand).resolves({}) as unknown as S3Client;

  const s3 = new S3Impl(config.s3Config, client);

  const db: PostgresJsDatabase = connectDB(config);

  await automigrateDB(db, config);
  const expoService = new ExpoPushService(expo);

  await resetDB(db);

  await seedDatabase(db);

  configureMiddlewares(app, config);

  setUpRoutes(app, db, config, s3, expoService);

  return app;
};
