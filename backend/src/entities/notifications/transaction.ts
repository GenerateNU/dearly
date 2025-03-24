import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { notificationsTable, usersTable, mediaTable } from "../schema";
import { Pagination } from "../../types/api/internal/users";
import { and, eq, desc } from "drizzle-orm";
import { MediaService } from "../media/service";
import { NotificationWithMedia as Notification } from "../../types/api/internal/notification";

/**
 * Interface defining the operations related to notifications in the transaction layer.
 * These operations allow fetching notifications with media URLs, given a specific user's ID and pagination details.
 */
export interface NotificationTransactions {
  /**
   * Fetches a list of notifications for a specific user, including related media URLs and user profile photos.
   * The results are paginated according to the provided limit and page.
   *
   * @param payload - An object containing `id` (receiver's user ID), `limit` (number of notifications to fetch), and `page` (page number for pagination).
   * @param mediaService - An instance of the `MediaService` to fetch signed URLs for media objects.
   * @returns A list of `Notification` objects, including media URLs and profile photo URLs, for the given user.
   */
  getNotifications(payload: Pagination, mediaService: MediaService): Promise<Notification[]>;
}

export class NotificationTransactionImpl implements NotificationTransactions {
  private db: PostgresJsDatabase;
  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getNotifications(
    { id, limit, page }: Pagination,
    mediaService: MediaService,
  ): Promise<Notification[]> {
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
        profilePhoto: usersTable.profilePhoto,
        objectKey: mediaTable.objectKey,
      })
      .from(notificationsTable)
      .innerJoin(
        mediaTable,
        and(eq(mediaTable.postId, notificationsTable.postId), eq(mediaTable.order, 0)),
      )
      .innerJoin(usersTable, eq(usersTable.id, notificationsTable.actorId))
      .where(eq(notificationsTable.receiverId, id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    if (!notificationPlain) {
      return [];
    }

    const notificationWithMedia = await Promise.all(
      notificationPlain.map(async ({ objectKey, profilePhoto, ...rest }) => {
        const signedURL = await mediaService.getSignedUrl(objectKey);
        const signedProfilePhotoURL = profilePhoto
          ? await mediaService.getSignedUrl(profilePhoto)
          : undefined;
        return {
          ...rest,
          mediaURL: signedURL,
          profilePhoto: signedProfilePhotoURL,
        };
      }),
    );

    return notificationWithMedia;
  }
}
