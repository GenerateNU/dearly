import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, likesTable, membersTable, postsTable, usersTable } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { PaginationParams } from "../../utilities/pagination";
import { IDPayload } from "../../types/id";
import { SearchedUser } from "../../types/api/internal/users";

export interface LikeTransaction {
  toggleLike(payload: IDPayload): Promise<boolean>;
  getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]>;
}

export class LikeTransactionImpl implements LikeTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async toggleLike({ id, userId }: IDPayload): Promise<boolean> {
    await this.checkMembership(id, userId);
    const isLiked = await this.db.transaction(async (tx) => {
      const existingLike = await tx
        .select()
        .from(likesTable)
        .where(and(eq(likesTable.postId, id), eq(likesTable.userId, userId)))
        .limit(1);

      if (existingLike.length > 0) {
        await tx
          .delete(likesTable)
          .where(and(eq(likesTable.postId, id), eq(likesTable.userId, userId)));
        return false;
      } else {
        await tx.insert(likesTable).values({ postId: id, userId });
        return true;
      }
    });
    return isLiked;
  }

  async getLikeUsers({
    id,
    userId,
    limit,
    page,
  }: IDPayload & PaginationParams): Promise<SearchedUser[]> {
    await this.checkMembership(id, userId);
    const likedUsers = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        isMember: sql<boolean>`TRUE`,
        profilePhoto: usersTable.profilePhoto,
      })
      .from(usersTable)
      .innerJoin(likesTable, eq(likesTable.userId, usersTable.id))
      .innerJoin(postsTable, eq(likesTable.postId, postsTable.id))
      .where(eq(postsTable.id, id))
      .limit(limit)
      .offset((page - 1) * limit);

    return likedUsers;
  }

  async checkMembership(postId: string, userId: string): Promise<void> {
    const [result] = await this.db
      .select({
        postId: postsTable.id,
        memberId: membersTable.userId,
      })
      .from(postsTable)
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .leftJoin(
        membersTable,
        and(eq(membersTable.groupId, groupsTable.id), eq(membersTable.userId, userId)),
      )
      .where(eq(postsTable.id, postId));

    if (!result) {
      throw new NotFoundError("Post");
    }

    const { memberId } = result;

    if (memberId === null) {
      throw new ForbiddenError();
    }
  }
}
