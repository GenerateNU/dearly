import { S3Client } from "@aws-sdk/client-s3";
import { NudgeSchedulerService } from "../../../services/nudgeScheduler";
import Expo from "expo-server-sdk";
import { SchedulerClient } from "@aws-sdk/client-scheduler";
import { SupabaseClient } from "@supabase/supabase-js";
import { MediaService } from "../../../entities/media/service";
import { NotificationService } from "../../../services/notification/service";
import { PushNotificationService } from "../../../services/notification/expo";

export interface AppService {
  nudgeSchedulerService: NudgeSchedulerService;
  mediaService: MediaService;
  expoService: PushNotificationService;
}

export interface ServerService extends AppService {
  pushNotificationService: NotificationService;
}

export interface ServiceIntegration {
  s3Client: S3Client;
  expoClient: Expo;
  schedulerClient: SchedulerClient;
  supabaseClient: SupabaseClient;
}
