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

export const resetDB = async (db: PostgresJsDatabase) => {
  // suppress the noisy logs
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
    console.log = originalLog;
  }
};
