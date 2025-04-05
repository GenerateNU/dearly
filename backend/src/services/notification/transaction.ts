import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  commentsTable,
  devicesTable,
  groupsTable,
  likesTable,
  membersTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "../../entities/schema";
import {
  LikeCommentNotificationMetadata,
  PostNotificationMetadata,
} from "../../types/api/internal/notification";
import { and, eq, ne, sql } from "drizzle-orm";
import { handleServiceError } from "../../utilities/errors/service-error";
import { Notification } from "../../types/api/internal/notification";
import { Post } from "../../types/api/internal/posts";
import { Like } from "../../types/api/internal/like";
import { Comment } from "../../types/api/internal/comments";

export interface NotificationTransaction {
  getPostMetadata(post: Post): Promise<PostNotificationMetadata | null>;
  getLikeMetadata(like: Like): Promise<LikeCommentNotificationMetadata | null>;
  getCommentMetadata(comment: Comment): Promise<LikeCommentNotificationMetadata | null>;
  insertNotifications(notifications: Notification[]): Promise<Notification[]>;
}

export class NotificationTransactionImpl implements NotificationTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getPostMetadata(post: Post): Promise<PostNotificationMetadata | null> {
    const getPostMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          username: usersTable.username,
          groupName: groupsTable.name,
          memberIDs: sql<string[]>`ARRAY_AGG(DISTINCT ${membersTable.userId})`,
          deviceTokens: sql<string[]>`ARRAY_REMOVE(ARRAY_AGG(DISTINCT 
            CASE 
              WHEN ${membersTable.postNotificationEnabled} IS TRUE 
              THEN ${devicesTable.token} 
            END
          ), NULL)`,
        })
        .from(postsTable)
        .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(membersTable, eq(membersTable.groupId, groupsTable.id))
        .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
        .where(and(eq(postsTable.id, post.id), ne(membersTable.userId, post.userId)))
        .groupBy(usersTable.username, groupsTable.name);

      return result ?? null;
    };
    return await handleServiceError(getPostMetadataImpl)();
  }

  async getLikeMetadata(like: Like): Promise<LikeCommentNotificationMetadata | null> {
    const getLikeMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          userId: postsTable.userId,
          username: usersTable.username,
          groupName: groupsTable.name,
          groupId: groupsTable.id,
          deviceTokens: sql<string[]>`ARRAY_AGG(DISTINCT ${devicesTable.token})`,
          isEnabled: membersTable.likeNotificationEnabled,
        })
        .from(postsTable)
        .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
        .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(likesTable, eq(likesTable.postId, postsTable.id))
        .innerJoin(usersTable, eq(usersTable.id, likesTable.userId))
        .where(and(eq(likesTable.id, like.id), ne(postsTable.userId, like.userId)))
        .groupBy(
          likesTable.id,
          postsTable.userId,
          usersTable.username,
          groupsTable.name,
          groupsTable.id,
          membersTable.likeNotificationEnabled,
        );

      return result ?? null;
    };
    return await handleServiceError(getLikeMetadataImpl)();
  }

  async getCommentMetadata(comment: Comment): Promise<LikeCommentNotificationMetadata | null> {
    const getCommentMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          userId: postsTable.userId,
          username: usersTable.username,
          groupName: groupsTable.name,
          groupId: groupsTable.id,
          isEnabled: membersTable.commentNotificationEnabled,
          deviceTokens: sql<string[]>`ARRAY_AGG(DISTINCT ${devicesTable.token})`,
        })
        .from(postsTable)
        .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
        .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
        .innerJoin(usersTable, eq(usersTable.id, commentsTable.userId))
        .where(and(eq(commentsTable.id, comment.id), ne(postsTable.userId, comment.userId)))
        .groupBy(
          postsTable.userId,
          usersTable.username,
          groupsTable.name,
          groupsTable.id,
          membersTable.commentNotificationEnabled,
        );

      return result ?? null;
    };
    return await handleServiceError(getCommentMetadataImpl)();
  }

  async insertNotifications(notifications: Notification[]): Promise<Notification[]> {
    return await this.db.insert(notificationsTable).values(notifications).onConflictDoNothing().returning();
  }
}
