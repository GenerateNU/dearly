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

export const startTestApp = async (): Promise<Hono> => {
  const app = new Hono();

  const config = getConfigurations();

  const mockS3Client = mockClient(S3Client);
  const client = mockS3Client.on(PutObjectCommand).resolves({}) as unknown as S3Client;

  const s3 = new S3Impl(config.s3Config, client);

  const db = connectDB(config);

  await automigrateDB(db, config);

  await resetDB(db);

  await seedDatabase(db);

  configureMiddlewares(app, config);

  setUpRoutes(app, db, s3);

  return app;
};
