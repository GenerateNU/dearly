import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { notificationsTable, usersTable, groupsTable, postsTable, mediaTable } from "../schema";
import { Pagination } from "../../types/api/internal/users";
import { and, eq, sql } from "drizzle-orm";
import { MediaService } from "../media/service";
import { Notification } from "../../types/api/internal/notification";

export interface NotificationTransactions {
  getNotifications(payload: Pagination, mediaService: MediaService): Promise<Notification[] | null>;
}

export class NotificationTransactionImpl implements NotificationTransactions {
  private db: PostgresJsDatabase;
  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getNotifications(
    { id, limit, page }: Pagination,
    mediaService: MediaService,
  ): Promise<Notification[] | null> {
    const notificationPlain = await this.db
      .select({
        id: notificationsTable.id,
        actorId: notificationsTable.actorId,
        receiverId: notificationsTable.receiverId,
        postId: notificationsTable.postId,
        referenceType: notificationsTable.referenceType,
        title: notificationsTable.title,
        description: notificationsTable.description,
        createdAt: notificationsTable.createdAt,
        groupId: notificationsTable.groupId,
        commentId: notificationsTable.commentId,
        likeId: notificationsTable.likeId,
        likeCommentId: notificationsTable.likeCommentId,
        objectKey: sql<string>`
                CASE 
                  WHEN ${notificationsTable.referenceType} = 'POST' THEN ${mediaTable.objectKey}
                  ELSE ${usersTable.profilePhoto}
                END
              `,
      })
      .from(notificationsTable)
      .leftJoin(
        mediaTable,
        and(
          eq(mediaTable.postId, notificationsTable.postId),
          eq(mediaTable.order, 0),
          eq(mediaTable.type, "PHOTO"),
        ),
      )
      .leftJoin(usersTable, eq(usersTable.id, notificationsTable.actorId))
      .where(eq(notificationsTable.receiverId, id))
      .limit(limit)
      .offset(page - 1);

    if (!notificationPlain) {
      return null;
    }

    const notificationWithMedia = await Promise.all(
      notificationPlain.map(async (item) => {
        const signedURL = await mediaService.getSignedUrl(item.objectKey);
        return { ...item, media_url: signedURL };
      }),
    );

    return notificationWithMedia;
  }
}
