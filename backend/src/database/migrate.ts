import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Configuration } from "../types/config";

/**
 * Automatically migrates the database if the environment is not production.
 *
 * This function performs an automatic migration of the database schema using the `drizzle-orm` migrator.
 * It will suppress log output during the migration process to avoid unnecessary console logging,
 * and restore the original `console.log` function afterward. The migration process will not run
 * if the environment is set to "production".
 *
 * @param {PostgresJsDatabase} db - The `drizzle` database client to use for migration.
 * @param {Configuration} config - The application configuration that contains the environment and automigration settings.
 * @returns {Promise<void>} A promise that resolves when the migration is complete or fails.
 */
export const automigrateDB = async (
  db: PostgresJsDatabase,
  config: Configuration,
): Promise<void> => {
  // Only run migrations if the environment is not "production"
  if (config.environment !== "production") {
    const originalLog = console.log;
    console.log = () => {}; // Override console.log to suppress logging

    try {
      await migrate(db, config.automigrate);
    } catch (error) {
      console.error(error);
      console.log("Failed to auto-migrate database");
    } finally {
      // Restore the original console.log after migration
      console.log = originalLog;
    }
  }
};
