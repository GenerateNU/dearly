import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { seed, reset } from "drizzle-seed";
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

export const seedWithRandomData = async (db: PostgresJsDatabase) => {
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
  await seed(db, tables);
};
