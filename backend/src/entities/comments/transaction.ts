import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { IDPayload } from "../../types/api/internal/id";
import {
  commentsTable,
  groupsTable,
  likeCommentsTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { eq, and, sql } from "drizzle-orm";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import {
  Comment,
  CommentPagination,
  CommentWithMetadata,
  CreateCommentPayload,
} from "../../types/api/internal/comments";

export interface CommentTransaction {
  toggleLikeComment(payload: IDPayload): Promise<boolean>;
  createComment(payload: CreateCommentPayload): Promise<Comment>;
  getComments(payload: CommentPagination): Promise<CommentWithMetadata[]>;
  deleteComment(payload: IDPayload): Promise<void>;
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

  async createComment(comment: CreateCommentPayload): Promise<Comment> {
    // checks that post exists
    const [post] = await this.db.select().from(postsTable).where(eq(postsTable.id, comment.postId));
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const [userInGroup] = await this.db
      .select()
      .from(groupsTable)
      .innerJoin(membersTable, eq(membersTable.groupId, post.groupId))
      .where(eq(membersTable.userId, comment.userId));
    if (!userInGroup) {
      throw new ForbiddenError("You do not have access to this post");
    }

    const [newComment] = await this.db.insert(commentsTable).values(comment).returning();
    if (!newComment) throw new InternalServerError("Failed to Create Comment");
    return newComment;
  }

  async getComments({
    userId,
    postId,
    limit,
    page,
  }: CommentPagination): Promise<CommentWithMetadata[]> {
    // check if postId is a valid post
    const [post] = await this.db.select().from(postsTable).where(eq(postsTable.id, postId));
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // check if user has access to this post
    const [userInGroup] = await this.db
      .select()
      .from(groupsTable)
      .innerJoin(membersTable, eq(membersTable.groupId, post.groupId))
      .where(eq(membersTable.userId, userId));

    if (!userInGroup) {
      throw new ForbiddenError("You do not have access to this post");
    }

    // select all comments under post and return as an array
    const comments = await this.db
      .select({
        id: commentsTable.id,
        userId: commentsTable.userId,
        postId: commentsTable.postId,
        content: commentsTable.content,
        voiceMemo: commentsTable.voiceMemo,
        createdAt: commentsTable.createdAt,
        username: usersTable.username,
        profilePhoto: usersTable.profilePhoto,
      })
      .from(commentsTable)
      .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .where(eq(commentsTable.postId, postId))
      .orderBy(commentsTable.createdAt)
      .limit(limit)
      .offset((page - 1) * limit);

    return comments;
  }

  async deleteComment({ id, userId }: IDPayload): Promise<void> {
    // If the user owns the comment, delete the comment from the table
    await this.checkCommentOwnership(id, userId);
    await this.db
      .delete(commentsTable)
      .where(and(eq(commentsTable.id, id), eq(commentsTable.userId, userId)));
  }

  // Check if the comment is owned by the user, and if not throw ForbiddenError
  async checkCommentOwnership(commentId: string, userId: string): Promise<void> {
    const [comment] = await this.db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, commentId));
    if (comment && comment.userId != userId) {
      throw new ForbiddenError("This comment is not owned by you");
    }
  }
}
