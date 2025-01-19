import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreatePostPayload, IDPayload, PostWithMedia, UpdatePostPayload } from "./validator";
import {
  commentsTable,
  groupsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
} from "../schema";
import { eq, and } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";

export interface PostTransaction {
  createPost(post: CreatePostPayload): Promise<PostWithMedia | null>;
  getPost(payload: IDPayload): Promise<PostWithMedia | null>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia | null>;
  deletePost(postId: string, userId: string): Promise<void>;
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

  async getPost(payload: IDPayload): Promise<PostWithMedia | null> {
    const result = await this.db
      .select()
      .from(postsTable)
      .innerJoin(mediaTable, eq(postsTable.id, mediaTable.postId))
      .innerJoin(groupsTable, eq(postsTable.groupId, groupsTable.id))
      .innerJoin(
        membersTable,
        and(eq(groupsTable.id, membersTable.groupId), eq(membersTable.userId, payload.userId)),
      )
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .leftJoin(likesTable, eq(postsTable.id, likesTable.postId))
      .where(eq(postsTable.id, payload.id));

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
    // check for ownership of the post
    const [post] = await this.db.select().from(postsTable).where(eq(postsTable.id, payload.id));
    if (post && post.userId != payload.userId) {
      throw new ForbiddenError();
    }

    // update post in database
    const updatedPostWithMedia = await this.db.transaction(async (tx) => {
      const updatedPostData: Partial<CreatePostPayload> = {};
      if (payload.caption !== undefined) updatedPostData.caption = payload.caption;
      if (payload.groupId !== undefined) updatedPostData.groupId = payload.groupId;

      const [updatedPost] = await tx
        .update(postsTable)
        .set(updatedPostData)
        .where(and(eq(postsTable.id, payload.id), eq(postsTable.userId, payload.userId)))
        .returning();

      if (!updatedPost) {
        return null;
      }

      // update associated media in database
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

  async deletePost(postId: string, userId: string): Promise<void> {
    const [post] = await this.db.select().from(postsTable).where(eq(postsTable.id, postId));

    // throw forbidden error if user not owner of post
    if (post && post.userId != userId) {
      throw new ForbiddenError();
    }

    await this.db
      .delete(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)));
  }
}
