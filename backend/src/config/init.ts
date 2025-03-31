import * as dotenv from "dotenv";
import { resolve } from "path";
import { Configuration } from "../types/config";
import { parseEnv, parseSSL } from "./helpers";

// Get the current environment (default is "test")
const nodeEnv = process.env.NODE_ENV || "test";
// Choose the appropriate environment file based on the environment
const envFile = nodeEnv === "test" || nodeEnv === "development" ? ".env.test" : ".env";

// Load environment variables from the appropriate .env file
dotenv.config({ path: resolve(__dirname, "../../../", envFile) });

/**
 * Retrieves the application configuration by parsing environment variables.
 * Returns a configuration object that can be used throughout the application.
 * @returns The application configuration object with various settings.
 */
export const getConfigurations = (): Configuration => {
  const config: Configuration = {
    server: {
      port: parseEnv("APP_PORT"),
    },
    database: {
      user: parseEnv("DB_USER"),
      password: parseEnv("DB_PASSWORD"),
      host: parseEnv("DB_HOST"),
      port: parseInt(parseEnv("DB_PORT")),
      database: parseEnv("DB_NAME"),
      ssl: parseSSL(parseEnv("DB_SSL")),
    },
    authorization: {
      jwtSecretKey: parseEnv("JWT_SECRET_KEY"),
    },
    cors: {
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    },
    automigrate: {
      migrationsFolder: "./src/migrations",
    },
    s3Config: {
      secretKey: parseEnv("AWS_SECRET_KEY"),
      publicKey: parseEnv("AWS_PUBLIC_KEY"),
      region: parseEnv("AWS_REGION"),
      name: parseEnv("AWS_BUCKET_NAME"),
    },
    lambdaConfig: {
      secretKey: parseEnv("AWS_SECRET_KEY"),
      publicKey: parseEnv("AWS_PUBLIC_KEY"),
      region: parseEnv("AWS_REGION_LAMBDA"),
      lambdaARN: parseEnv("NUDGE_LAMBDA_ARN"),
      lambdaRoleARN: parseEnv("NUDGE_LAMBDA_ROLE_ARN"),
    },
    slackConfig: {
      expoSignature: parseEnv("SECRET_WEBHOOK_KEY"),
      slackWebhookUrl: parseEnv("SLACK_WEBHOOK_URL"),
      slackChannelID: parseEnv("SLACK_CHANNEL_ID"),
      slackUserID: parseEnv("SLACK_USER_GROUP_ID"),
      qrCodeGenerator: parseEnv("BUILD_QR_CODE_GENERATOR"),
    },
    environment: nodeEnv,
    supabase: {
      url: parseEnv("SUPABASE_URL"),
      key: parseEnv("SUPABASE_KEY"),
    },
  };
  return config;
};
