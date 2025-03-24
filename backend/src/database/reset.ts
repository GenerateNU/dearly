import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { reset } from "drizzle-seed";
import {
  postsTable,
  usersTable,
  groupsTable,
  membersTable,
  notificationsTable,
  invitationsTable,
  linksTable,
  likesTable,
  commentsTable,
} from "../entities/schema";

/**
 * Resets the database by clearing data from all relevant tables.
 *
 * This function uses the `drizzle-seed` library to reset multiple database tables.
 * It suppresses the `console.log` outputs to avoid unnecessary log noise during the reset process.
 * If any errors occur during the reset process, they are caught and logged to the console.
 * Once the process is completed, the original `console.log` function is restored.
 *
 * @param {PostgresJsDatabase} db - The `drizzle-orm` database client used to interact with the database.
 * @returns {Promise<void>} A promise that resolves when the database reset is complete or fails.
 */
export const resetDB = async (db: PostgresJsDatabase): Promise<void> => {
  const originalLog = console.log;
  console.log = () => {};

  try {
    const tables = {
      postsTable,
      usersTable,
      membersTable,
      groupsTable,
      notificationsTable,
      invitationsTable,
      linksTable,
      likesTable,
      commentsTable,
    };

    await reset(db, tables);
  } catch (error) {
    console.error("Error resetting the database:", error);
  } finally {
    // Restore the original console.log after the reset operation
    console.log = originalLog;
  }
};
