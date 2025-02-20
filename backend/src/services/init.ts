import { S3Client } from "@aws-sdk/client-s3";
import { Configuration } from "../types/config";
import { S3ServiceImpl } from "./s3Service";
import { SchedulerClient } from "@aws-sdk/client-scheduler";
import { AWSEventBridgeScheduler } from "./nudgeScheduler";
import { ExpoPushService } from "./notification/expo";
import Expo from "expo-server-sdk";
import { ExpoNotificationService } from "./notification/service";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { NotificationTransactionImpl } from "./notification/transaction";
import { createClient } from "@supabase/supabase-js";
import { ServerService, ServiceIntegration } from "../types/api/internal/services";
import { MediaServiceImpl } from "../entities/media/service";

export const initIntegration = (
  config: Configuration,
  s3Client: S3Client = new S3Client({
    region: config.s3Config.region,
    credentials: {
      accessKeyId: config.s3Config.publicKey,
      secretAccessKey: config.s3Config.secretKey,
    },
  }),
  expoClient: Expo = new Expo(),
  schedulerClient: SchedulerClient = new SchedulerClient(),
  supabaseClient: ReturnType<typeof createClient> = createClient(
    config.supabase.url,
    config.supabase.key,
  ),
): ServiceIntegration => {
  return {
    s3Client,
    expoClient,
    schedulerClient,
    supabaseClient,
  };
};

export const initService = (
  { s3Client, expoClient, schedulerClient, supabaseClient }: ServiceIntegration,
  db: PostgresJsDatabase,
  config: Configuration,
): ServerService => {
  const s3Service = new S3ServiceImpl(config.s3Config, s3Client);

  const expoService = new ExpoPushService(expoClient);
  const mediaService = new MediaServiceImpl(db, s3Service);
  const nudgeSchedulerService = new AWSEventBridgeScheduler(schedulerClient);
  const pushNotificationService = new ExpoNotificationService(
    supabaseClient,
    new NotificationTransactionImpl(db),
    expoService,
  );

  return {
    mediaService,
    nudgeSchedulerService,
    pushNotificationService,
    expoService,
  };
};
