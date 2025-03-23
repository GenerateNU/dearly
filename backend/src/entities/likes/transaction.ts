import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, likesTable, membersTable, postsTable, usersTable } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { PaginationParams } from "../../utilities/api/pagination";
import { IDPayload } from "../../types/api/internal/id";
import { SearchedUser } from "../../types/api/internal/users";

/**
 * Interface defining the operations related to the transaction layer for handling likes on posts.
 * This includes toggling likes and fetching users who liked a post, along with checking user membership.
 */
export interface LikeTransaction {
  /**
   * Toggles the like status for a specific post by a user.
   * If the user has already liked the post, it will remove the like; otherwise, it will add the like.
   *
   * @param payload - An object containing the `id` (post ID) of the post and `userId` of the user performing the action.
   * @returns A boolean indicating whether the like was successfully added (true) or removed (false).
   */
  toggleLike(payload: IDPayload): Promise<boolean>;

  /**
   * Retrieves a list of users who have liked a specific post, with pagination support.
   * The result includes user information such as name, username, profile photo, and a membership status flag.
   *
   * @param payload - An object containing the `id` (post ID), `userId` (to check user's membership), and pagination details (`limit` and `page`).
   * @returns A list of `SearchedUser` objects representing the users who liked the post, including their profile photos and membership status.
   */
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
