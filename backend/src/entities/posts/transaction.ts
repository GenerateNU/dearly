import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  commentsTable,
  groupsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { IDPayload } from "../../types/id";
import {
  CreatePostPayload,
  PostWithMedia,
  UpdatePostPayload,
} from "../../types/api/internal/posts";
import { Media } from "../../types/api/internal/media";

export interface PostTransaction {
  createPost(post: CreatePostPayload): Promise<PostWithMedia | null>;
  getPost(payload: IDPayload): Promise<PostWithMedia | null>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia | null>;
  deletePost(payload: IDPayload): Promise<void>;
}

export class PostTransactionImpl implements PostTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async createPost(post: CreatePostPayload): Promise<PostWithMedia | null> {
    const postPayload = {
      userId: post.userId,
      groupId: post.groupId,
      caption: post.caption,
    };
    const mediaPayload = post.media;

    const postWithMedia = await this.db.transaction(async (tx) => {
      // check if user is a member of the group
      const isMember = await tx
        .select()
        .from(membersTable)
        .where(and(eq(membersTable.userId, post.userId), eq(membersTable.groupId, post.groupId)))
        .limit(1);

      if (isMember.length === 0) {
        throw new NotFoundError("Group");
      }

      // insert post
      const [newPost] = await tx.insert(postsTable).values(postPayload).returning();
      if (!newPost) return null;

      // insert media if provided
      const insertedMedia = mediaPayload?.length
        ? await tx
            .insert(mediaTable)
            .values(mediaPayload.map((media) => ({ postId: newPost.id, ...media })))
            .returning()
        : [];

      // fetch user profile photo using JOIN
      const [user] = await tx
        .select({ profilePhoto: usersTable.profilePhoto })
        .from(usersTable)
        .where(eq(usersTable.id, newPost.userId));

      return {
        id: newPost.id,
        userId: newPost.userId,
        groupId: newPost.groupId,
        caption: newPost.caption,
        createdAt: newPost.createdAt,
        media: insertedMedia,
        comments: 0,
        likes: 0,
        isLiked: false,
        location: newPost.location,
        profilePhoto: user?.profilePhoto || null,
      };
    });

    return postWithMedia;
  }

  async getPost({ id, userId }: IDPayload): Promise<PostWithMedia | null> {
    const [result] = await this.db
      .select({
        id: postsTable.id,
        userId: postsTable.userId,
        groupId: postsTable.groupId,
        createdAt: postsTable.createdAt,
        caption: postsTable.caption,
        profilePhoto: usersTable.profilePhoto,
        location: postsTable.location,
        comments: sql<number>`COALESCE(COUNT(DISTINCT ${commentsTable.id}), 0)`,
        likes: sql<number>`COALESCE(COUNT(DISTINCT ${likesTable.id}), 0)`,
        isLiked: sql<boolean>`COALESCE(BOOL_OR(${likesTable.userId} = ${userId}), false)`,
        media: sql<Media[]>`COALESCE(ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', ${mediaTable.id},
            'type', ${mediaTable.type},
            'postId', ${mediaTable.postId},
            'objectKey', ${mediaTable.objectKey}
          )
        )`,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .leftJoin(mediaTable, eq(postsTable.id, mediaTable.postId))
      .innerJoin(groupsTable, eq(postsTable.groupId, groupsTable.id))
      .innerJoin(
        membersTable,
        and(eq(groupsTable.id, membersTable.groupId), eq(membersTable.userId, userId)),
      )
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .leftJoin(likesTable, eq(likesTable.postId, id))
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
        postsTable.location,
        usersTable.profilePhoto,
      )
      .where(eq(postsTable.id, id));

    if (!result) return null;

    return result;
  }

  async updatePost({
    id,
    userId,
    caption,
    media,
  }: UpdatePostPayload): Promise<PostWithMedia | null> {
    await this.checkPostOwnership(id, userId);

    const updatedPostWithMedia = await this.db.transaction(async (tx) => {
      // update post caption
      const [updatedPost] = await tx
        .update(postsTable)
        .set({ caption })
        .where(and(eq(postsTable.id, id), eq(postsTable.userId, userId)))
        .returning();

      if (!updatedPost) return null;

      // update associated media
      let updatedMedia = [];
      if (media?.length) {
        await tx.delete(mediaTable).where(eq(mediaTable.postId, id)); // Clear old media
        updatedMedia = await tx
          .insert(mediaTable)
          .values(media.map((m) => ({ postId: updatedPost.id, ...m })))
          .returning();
      } else {
        updatedMedia = await tx
          .select()
          .from(mediaTable)
          .where(eq(mediaTable.postId, updatedPost.id));
      }

      // fetch updated likes, comments, and profile photo using JOIN
      const [post] = await tx
        .select({
          comments: sql<number>`COALESCE(COUNT(DISTINCT ${commentsTable.id}), 0)`,
          likes: sql<number>`COALESCE(COUNT(DISTINCT ${likesTable.id}), 0)`,
          isLiked: sql<boolean>`COALESCE(BOOL_OR(${likesTable.userId} = ${userId}), false)`,
          profilePhoto: usersTable.profilePhoto,
        })
        .from(postsTable)
        .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
        .leftJoin(commentsTable, eq(commentsTable.postId, id))
        .leftJoin(likesTable, eq(likesTable.postId, id))
        .where(eq(postsTable.id, id))
        .groupBy(postsTable.id, usersTable.profilePhoto);

      if (!post) return null;

      return {
        id: updatedPost.id,
        userId: updatedPost.userId,
        groupId: updatedPost.groupId,
        caption: updatedPost.caption,
        createdAt: updatedPost.createdAt,
        location: updatedPost.location,
        media: updatedMedia,
        comments: post.comments,
        likes: post.likes,
        isLiked: post.isLiked,
        profilePhoto: post.profilePhoto,
      };
    });

    return updatedPostWithMedia;
  }

  async deletePost({ id, userId }: IDPayload): Promise<void> {
    await this.checkPostOwnership(id, userId);
    await this.db
      .delete(postsTable)
      .where(and(eq(postsTable.id, id), eq(postsTable.userId, userId)));
  }

  async checkPostOwnership(postId: string, userId: string): Promise<void> {
    const [post] = await this.db.select().from(postsTable).where(eq(postsTable.id, postId));
    if (post && post.userId != userId) {
      throw new ForbiddenError();
    }
  }
}
