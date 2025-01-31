import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { IDPayload } from "../../types/id";
import { commentsTable, likeCommentsTable, membersTable, postsTable } from "../schema";
import { and, eq, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";

export interface CommentTransaction {
  toggleLikeComment(payload: IDPayload): Promise<boolean>;
}

export class CommentTransactionImpl implements CommentTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async toggleLikeComment({ id: commentId, userId }: IDPayload): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [result] = await tx
        .select({
          exists: sql<boolean>`true`,
          isMember: sql<boolean>`${membersTable.userId} IS NOT NULL`,
          existingLike: sql<boolean>`EXISTS (
            SELECT 1 FROM ${likeCommentsTable}
            WHERE ${eq(likeCommentsTable.userId, userId)} 
            AND ${eq(likeCommentsTable.commentId, commentId)}
          )`,
        })
        .from(commentsTable)
        .innerJoin(postsTable, eq(commentsTable.postId, postsTable.id))
        .leftJoin(
          membersTable,
          and(eq(membersTable.groupId, postsTable.groupId), eq(membersTable.userId, userId)),
        )
        .where(eq(commentsTable.id, commentId));

      // no result returns -> comment does not exist
      if (!result) {
        throw new NotFoundError("Comment");
      }

      // isMember is undefined -> not a member of group
      if (!result.isMember) {
        throw new ForbiddenError();
      }

      // toggle like of comments
      if (result.existingLike) {
        await tx
          .delete(likeCommentsTable)
          .where(
            and(eq(likeCommentsTable.userId, userId), eq(likeCommentsTable.commentId, commentId)),
          );
        return false;
      } else {
        await tx.insert(likeCommentsTable).values({ userId, commentId });
        return true;
      }
    });
  }
}
