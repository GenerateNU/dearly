import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Configuration } from "../types/config";

export const automigrateDB = async (db: PostgresJsDatabase, config: Configuration) => {
  if (config.environment !== "production") {
    const originalLog = console.log;
    console.log = () => {};
    try {
      await migrate(db, config.automigrate);
    } catch (error) {
      console.error(error);
      console.log("Failed to auto-migrate database");
    } finally {
      console.log = originalLog;
    }
  }
};
