import { sql, eq, and } from "drizzle-orm";
import {
  commentsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../../entities/schema";
import { Media } from "../../types/api/internal/media";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Transaction } from "../../types/api/internal/transaction";

export const getPostMetadata = (userId: string) => {
  return {
    id: postsTable.id,
    userId: postsTable.userId,
    groupId: postsTable.groupId,
    createdAt: postsTable.createdAt,
    caption: postsTable.caption,
    location: postsTable.location,
    profilePhoto: usersTable.profilePhoto,
    username: usersTable.username,
    name: usersTable.name,
    comments: sql<number>`COUNT(DISTINCT ${commentsTable.id})`.mapWith(Number),
    likes: sql<number>`COUNT(DISTINCT ${likesTable.id})`.mapWith(Number),
    isLiked: sql<boolean>`BOOL_OR(CASE WHEN ${likesTable.userId} = ${userId} THEN true ELSE false END)`,
    media: sql<Media[]>`ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'id', ${mediaTable.id},
          'type', ${mediaTable.type},
          'postId', ${mediaTable.postId},
          'objectKey', ${mediaTable.objectKey}
        ) ORDER BY ${mediaTable.order} ASC
      )`,
  };
};

export const getSharedGroups = (db: PostgresJsDatabase, viewee: string, viewer: string) => {
  return db
    .select({ groupId: membersTable.groupId })
    .from(membersTable)
    .where(eq(membersTable.userId, viewee))
    .intersect(
      db
        .select({ groupId: membersTable.groupId })
        .from(membersTable)
        .where(eq(membersTable.userId, viewer)),
    );
};

/**
 * Determines if a given user is the manager of the given group.
 */
export const isManager = async (tx: Transaction, userId: string, groupId: string) => {
  const [manager] = await tx
    .select()
    .from(membersTable)
    .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)));

  if (!manager) {
    return false;
  } else {
    return manager.role === "MANAGER";
  }
};
