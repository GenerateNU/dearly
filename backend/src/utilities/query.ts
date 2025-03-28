import { sql, eq } from "drizzle-orm";
import {
  commentsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../entities/schema";
import { Media } from "../types/api/internal/media";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

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
    comments: sql<number>`(
      SELECT COUNT(*) 
      FROM ${commentsTable}
      WHERE ${commentsTable.postId} = ${postsTable.id}
    )`.mapWith(Number),
    likes: sql<number>`(
      SELECT COUNT(*) 
      FROM ${likesTable}
      WHERE ${likesTable.postId} = ${postsTable.id}
    )`.mapWith(Number),
    isLiked: sql<boolean>`(
      SELECT COALESCE(
        BOOL_OR(CASE WHEN ${likesTable.userId} = ${userId} THEN true ELSE false END),
        false
      )
      FROM ${likesTable}
      WHERE ${likesTable.postId} = ${postsTable.id}
    )`,
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
