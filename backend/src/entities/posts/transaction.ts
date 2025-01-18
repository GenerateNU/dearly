import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreatePostPayload, PostWithMedia, UpdatePostPayload } from "./validator";
import { commentsTable, likesTable, mediaTable, postsTable } from "../schema";
import { eq, and } from "drizzle-orm";

export interface PostTransaction {
  createPost(post: CreatePostPayload): Promise<PostWithMedia | null>;
  getPost(id: string): Promise<PostWithMedia | null>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia | null>;
  deletePost(id: string): Promise<void>;
  isOwner(postId: string, userId: string): Promise<boolean>;
}

export class PostTransactionImpl implements PostTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async isOwner(postId: string, userId: string): Promise<boolean> {
    const [post] = await this.db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)))
      .limit(1);

    return post !== undefined;
  }

  async createPost(post: CreatePostPayload): Promise<PostWithMedia | null> {
    const postPayload = {
      userId: post.userId,
      groupId: post.groupId,
      caption: post.caption,
    };
    const mediaPayload = post.media;

    const postWithMedia = await this.db.transaction(async (tx) => {
      // insert the post
      const [newPost] = await tx.insert(postsTable).values(postPayload).returning();

      if (!newPost) {
        return null;
      }

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

  async getPost(postId: string): Promise<PostWithMedia | null> {
    const result = await this.db
      .select()
      .from(postsTable)
      .innerJoin(mediaTable, eq(postsTable.id, mediaTable.postId))
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .leftJoin(likesTable, eq(postsTable.id, likesTable.postId))
      .where(eq(postsTable.id, postId));

    if (!result[0]) return null;

    const post = result[0].posts;
    const media = result.map((r) => r.media).filter((m) => m !== null);

    // TODO: return post with comments and likes later
    return {
      ...post,
      media,
    };
  }

  async updatePost(payload: UpdatePostPayload): Promise<PostWithMedia | null> {
    const updatedPostWithMedia = await this.db.transaction(async (tx) => {
      const updatedPostData: Partial<CreatePostPayload> = {};
      if (payload.caption !== undefined) updatedPostData.caption = payload.caption;
      if (payload.groupId !== undefined) updatedPostData.groupId = payload.groupId;

      const [updatedPost] = await tx
        .update(postsTable)
        .set(updatedPostData)
        .where(eq(postsTable.id, payload.id))
        .returning();

      if (!updatedPost) {
        return null;
      }

      let media;

      if (payload.media) {
        await tx.delete(mediaTable).where(eq(mediaTable.postId, payload.id));
        media = await tx
          .insert(mediaTable)
          .values(payload.media.map((m) => ({ postId: updatedPost.id, ...m })))
          .returning();
      } else {
        media = await tx.select().from(mediaTable).where(eq(mediaTable.postId, updatedPost.id));
      }

      return {
        id: updatedPost.id,
        userId: updatedPost.userId,
        groupId: updatedPost.groupId,
        caption: updatedPost.caption,
        createdAt: updatedPost.createdAt,
        media: media,
      };
    });

    return updatedPostWithMedia;
  }

  async deletePost(id: string): Promise<void> {
    await this.db.delete(postsTable).where(eq(postsTable.id, id)).returning();
  }
}
