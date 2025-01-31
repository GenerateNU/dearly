import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { IDPayload } from "../../types/id";
import { commentsTable, likeCommentsTable, membersTable, postsTable } from "../schema";
import { and, eq } from "drizzle-orm";
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
      // check comments exist or not
      const [comment] = await tx
        .select({ groupId: postsTable.groupId })
        .from(commentsTable)
        .innerJoin(postsTable, eq(commentsTable.postId, postsTable.id))
        .where(eq(commentsTable.id, commentId))
        .limit(1);

      if (!comment) {
        throw new NotFoundError("Comment");
      }

      const groupId = comment.groupId;

      // check if user is a member or not
      const [member] = await tx
        .select()
        .from(membersTable)
        .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)));

      if (!member) {
        throw new ForbiddenError();
      }

      // toggle comment like if user is a member
      const [existingLike] = await tx
        .select()
        .from(likeCommentsTable)
        .where(
          and(eq(likeCommentsTable.userId, userId), eq(likeCommentsTable.commentId, commentId)),
        );

      if (existingLike) {
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
