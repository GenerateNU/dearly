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
      port: parseEnv("APP_PORT"), // Port for the server to listen on
    },
    database: {
      user: parseEnv("DB_USER"), // Database username
      password: parseEnv("DB_PASSWORD"), // Database password
      host: parseEnv("DB_HOST"), // Database host (e.g., localhost or DB server)
      port: parseInt(parseEnv("DB_PORT")), // Database port
      database: parseEnv("DB_NAME"), // Database name
      ssl: parseSSL(parseEnv("DB_SSL")), // SSL configuration for database connection
    },
    authorization: {
      jwtSecretKey: parseEnv("JWT_SECRET_KEY"), // Secret key for JWT authorization
    },
    cors: {
      origin: "*", // Allowed origins for cross-origin resource sharing (CORS)
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
      allowHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"], // Allowed headers
    },
    automigrate: {
      migrationsFolder: "./src/migrations", // Path to migration files for automatic migration
    },
    s3Config: {
      secretKey: parseEnv("AWS_SECRET_KEY"), // AWS secret key for S3
      publicKey: parseEnv("AWS_PUBLIC_KEY"), // AWS public key for S3
      region: parseEnv("AWS_REGION"), // AWS region for S3 bucket
      name: parseEnv("AWS_BUCKET_NAME"), // AWS S3 bucket name
    },
    lambdaConfig: {
      lambdaARN: parseEnv("NUDGE_LAMBDA_ARN"), // ARN for the AWS Lambda function
      lambdaRoleARN: parseEnv("NUDGE_LAMBDA_ROLE_ARN"), // ARN for the IAM role associated with the Lambda function
    },
    slackConfig: {
      expoSignature: parseEnv("SECRET_WEBHOOK_KEY"), // Secret key for Slack webhook verification
      slackWebhookUrl: parseEnv("SLACK_WEBHOOK_URL"), // Slack webhook URL for sending notifications
      slackChannelID: parseEnv("SLACK_CHANNEL_ID"), // Slack channel ID for notifications
      slackUserID: parseEnv("SLACK_USER_GROUP_ID"), // Slack user group ID for notifications
      qrCodeGenerator: parseEnv("BUILD_QR_CODE_GENERATOR"), // URL or service for generating QR codes
    },
    environment: nodeEnv, // The current environment (e.g., "development", "production", "test")
    supabase: {
      url: parseEnv("SUPABASE_URL"), // Supabase instance URL
      key: parseEnv("SUPABASE_KEY"), // Supabase API key
    },
  };
  return config;
};
