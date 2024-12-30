import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Configuration, DatabaseConfig } from "../types/config";
import postgres from "postgres";

export const connectDB = (config: Configuration): PostgresJsDatabase => {
  const connectionString = formatConnString(config.database);

  const client = postgres(connectionString, {
    prepare: false,
    ssl: config.database.ssl as boolean | "require" | object,
  });

  const db: PostgresJsDatabase = drizzle({ client });

  return db;
};

export const formatConnString = (dbConfig: DatabaseConfig): string => {
  return `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
};
