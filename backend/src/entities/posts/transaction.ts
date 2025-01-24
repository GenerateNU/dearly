import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreatePostPayload, Media, PostWithMedia, UpdatePostPayload } from "./validator";
import { groupsTable, mediaTable, membersTable, postsTable } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { IDPayload } from "../../types/id";

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
      // check if a user is member of a group
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
      if (mediaPayload && mediaPayload.length > 0) {
        const insertedMedia = await tx
          .insert(mediaTable)
          .values(mediaPayload.map((media) => ({ postId: newPost.id, ...media })))
          .returning();

        return {
          id: newPost.id,
          userId: newPost.userId,
          groupId: newPost.groupId,
          caption: newPost.caption,
          createdAt: newPost.createdAt,
          media: insertedMedia,
        };
      }
      return null;
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
        media: sql<Media[]>`array_agg(
        json_build_object(
          'id', ${mediaTable.id},
          'type', ${mediaTable.type},
          'postId', ${mediaTable.postId},
          'objectKey', ${mediaTable.objectKey}
        )
      )`,
      })
      .from(postsTable)
      .innerJoin(mediaTable, eq(postsTable.id, mediaTable.postId))
      .innerJoin(groupsTable, eq(postsTable.groupId, groupsTable.id))
      .innerJoin(
        membersTable,
        and(eq(groupsTable.id, membersTable.groupId), eq(membersTable.userId, userId)),
      )
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
      )
      .where(eq(postsTable.id, id));

    if (!result) return null;

    // TODO: return post with comments and likes later
    return result;
  }

  async updatePost({
    id,
    userId,
    caption,
    media,
  }: UpdatePostPayload): Promise<PostWithMedia | null> {
    await this.checkPostOwnership(id, userId);

    // update post
    const updatedPostWithMedia = await this.db.transaction(async (tx) => {
      const [updatedPost] = await tx
        .update(postsTable)
        .set({ caption: caption })
        .where(and(eq(postsTable.id, id), eq(postsTable.userId, userId)))
        .returning();

      if (!updatedPost) return null;

      // update associated media
      let updatedMedia;
      if (media) {
        await tx.delete(mediaTable).where(eq(mediaTable.postId, id));
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

      return {
        id: updatedPost.id,
        userId: updatedPost.userId,
        groupId: updatedPost.groupId,
        caption: updatedPost.caption,
        createdAt: updatedPost.createdAt,
        media: updatedMedia,
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
