import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Configuration, DatabaseConfig } from "../types/config";
import postgres from "postgres";

/**
 * Connects to the PostgreSQL database using the provided configuration.
 *
 * This function constructs a connection string from the configuration and connects to the PostgreSQL database using the
 * `postgres` client, which is then wrapped by the `drizzle` ORM to manage database queries.
 *
 * @param {Configuration} config - The application configuration containing the database connection details.
 * @returns {PostgresJsDatabase} The `drizzle` database client that is connected to the PostgreSQL database.
 */
export const connectDB = (config: Configuration): PostgresJsDatabase => {
  const connectionString = formatConnString(config.database);

  const client = postgres(connectionString, {
    prepare: false,
    ssl: config.database.ssl as boolean | "require" | object,
  });

  const db: PostgresJsDatabase = drizzle({ client });

  return db;
};

/**
 * Formats the connection string for PostgreSQL based on the provided database configuration.
 *
 * The connection string is used to connect to the database using the `postgres` client. It is structured as:
 * `postgres://user:password@host:port/database`.
 *
 * @param {DatabaseConfig} dbConfig - The database configuration object containing user, password, host, port, and database details.
 * @returns {string} The formatted PostgreSQL connection string.
 */
export const formatConnString = (dbConfig: DatabaseConfig): string => {
  return `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
};
