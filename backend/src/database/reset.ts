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
  mediaTable,
  likesTable,
  commentsTable,
} from "../entities/schema";

export const resetDB = async (db: PostgresJsDatabase) => {
  const tables = {
    postsTable,
    usersTable,
    membersTable,
    groupsTable,
    notificationsTable,
    invitationsTable,
    linksTable,
    mediaTable,
    likesTable,
    commentsTable,
  };
  await reset(db, tables);
};
