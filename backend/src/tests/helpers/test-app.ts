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
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { mockSchedulerClient } from "./mock";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

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
  const client = mockS3Client.on(PutObjectCommand).resolves({}) as unknown as S3Client;

  const s3 = new S3Impl(config.s3Config, client);

  configureMiddlewares(app, config);

  setUpRoutes(app, db, config, s3, schedulerClient);

  return app;
};
