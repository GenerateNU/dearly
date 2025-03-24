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

/**
 * Initializes the necessary service integrations (e.g., S3, Expo, Scheduler, Supabase).
 * 
 * This function sets up clients for external services such as AWS S3, Expo Push Notifications, AWS Scheduler,
 * and Supabase. The initialized clients can be used for various tasks like media storage, push notifications,
 * event scheduling, and interacting with Supabase.
 * 
 * **Parameters:**
 * - `config` (Configuration): Configuration object that contains the settings needed to configure external services.
 * - `s3Client` (S3Client, optional): An AWS S3 client instance (defaults to a new instance configured with `config.s3Config`).
 * - `expoClient` (Expo, optional): An Expo client instance for push notifications (defaults to a new instance).
 * - `schedulerClient` (SchedulerClient, optional): An AWS Scheduler client instance (defaults to a new instance).
 * - `supabaseClient` (ReturnType<typeof createClient>, optional): A Supabase client instance for database interaction (defaults to a new instance).

 * **Returns:**
 * - `ServiceIntegration`: An object containing initialized service clients, including:
 *   - `s3Client`: AWS S3 client
 *   - `expoClient`: Expo client for push notifications
 *   - `schedulerClient`: AWS Scheduler client
 *   - `supabaseClient`: Supabase client for interacting with the Supabase database
 */
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

/**
 * Initializes the services required for handling media, push notifications, and event scheduling.
 *
 * This function creates and returns service instances that interact with various external services such as AWS S3,
 * Expo Push Notifications, AWS Scheduler, and Supabase. These services include media handling, push notifications,
 * and scheduling tasks.
 *
 * **Parameters:**
 * - `integration` (ServiceIntegration): An object containing initialized clients for external services (S3, Expo, Scheduler, Supabase).
 * - `db` (PostgresJsDatabase): A PostgresJsDatabase instance used for database interaction.
 * - `config` (Configuration): Configuration object containing service settings.
 *
 * **Returns:**
 * - `ServerService`: An object containing service instances for media, push notifications, and scheduling, including:
 *   - `mediaService`: Service for handling media (e.g., uploading to S3)
 *   - `nudgeSchedulerService`: Service for scheduling tasks/events (using AWS EventBridge Scheduler)
 *   - `pushNotificationService`: Service for sending push notifications via Expo
 *   - `expoService`: Service for handling Expo push notifications
 */
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
