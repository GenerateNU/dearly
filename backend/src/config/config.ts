import * as dotenv from "dotenv";
import { resolve } from "path";
import { Configuration } from "../types/config";

const nodeEnv = process.env.NODE_ENV || "test";
const envFile = nodeEnv === "test" || nodeEnv === "development" ? ".env.test" : ".env";

dotenv.config({ path: resolve(__dirname, "../../../", envFile) });

const parseEnv = (envVarName: string): string => {
  const value = process.env[envVarName] || "";
  if (!value) {
    throw new Error(`Missing required environment variable: ${envVarName}`);
  }
  return value;
};

const parseSSL = (value: string): boolean | "require" => {
  const lowerValue = value.toLowerCase();
  if (lowerValue === "true") return true;
  if (lowerValue === "false") return false;
  if (lowerValue === "require") return lowerValue;
  throw new Error(`Invalid value for SSL environment variable`);
};

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
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    },
    automigrate: {
      migrationsFolder: "./src/migrations",
    },
    s3Config: {
      secretKey: parseEnv("AWS_SECERET_KEY"),
      publicKey: parseEnv("AWS_PUBLIC_KEY"),
      region: parseEnv("AWS_REGION"),
      name: parseEnv("AWS_BUCKET_NAME"),
    },
    environment: nodeEnv,
  };
  return config;
};
