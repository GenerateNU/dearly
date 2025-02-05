import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { notificationsTable, usersTable, groupsTable, postsTable } from "../schema";
import { Pagination } from "../../types/api/internal/users";
import { eq } from "drizzle-orm";
import { MediaService } from "../media/service";

export interface NotificationTransactions {
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
  ): Promise<Notification[] | null> {
    const notificationPlain = await this.db
      .select(notificationsTable.columns, usersTable.profilePhoto)
      .from(notificationsTable)
      .where(eq(notificationsTable.receiverId, id))
      .innerJoin(usersTable)
      .limit(limit)
      .offset(page - 1);
  }
}
