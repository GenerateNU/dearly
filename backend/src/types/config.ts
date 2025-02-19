export interface ServerConfig {
  port: string;
}

export interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl: boolean | string | object;
}

export interface AuthorizationConfig {
  jwtSecretKey: string;
}

export interface CorsConfig {
  origin: string;
  allowMethods: string[];
  allowHeaders: string[];
}

export interface S3Config {
  secretKey: string;
  publicKey: string;
  region: string;
  name: string;
}

export interface SupabaseInfo {
  key: string;
  url: string;
}

export interface LambdaConfig {
  lambdaARN: string;
  lambdaRoleARN: string;
}

export interface SlackConfig {
  expoSignature: string;
  slackWebhookUrl: string;
  slackUserID: string;
  slackChannelID: string;
  qrCodeGenerator: string;
}

export interface Configuration {
  server: ServerConfig;
  database: DatabaseConfig;
  authorization: AuthorizationConfig;
  cors: CorsConfig;
  automigrate: {
    migrationsFolder: string;
  };
  s3Config: S3Config;
  lambdaConfig: LambdaConfig;
  slackConfig: SlackConfig;
  environment: string;
  supabase: SupabaseInfo;
}
