import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreatePostPayload, IDPayload, Media, PostWithMedia, UpdatePostPayload } from "./validator";
import {
  groupsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { SearchedUser } from "../users/validator";
import { PaginationParams } from "../../utilities/pagination";

export interface PostTransaction {
  createPost(post: CreatePostPayload): Promise<PostWithMedia | null>;
  getPost(payload: IDPayload): Promise<PostWithMedia | null>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia | null>;
  deletePost(payload: IDPayload): Promise<void>;
  toggleLike(payload: IDPayload): Promise<void>;
  getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]>;
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
          'url', ${mediaTable.url}
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

  async toggleLike({ id, userId }: IDPayload): Promise<void> {
    await this.checkMembership(id, userId);
    await this.db.transaction(async (tx) => {
      const existingLike = await tx
        .select()
        .from(likesTable)
        .where(and(eq(likesTable.postId, id), eq(likesTable.userId, userId)))
        .limit(1);

      if (existingLike.length > 0) {
        await tx
          .delete(likesTable)
          .where(and(eq(likesTable.postId, id), eq(likesTable.userId, userId)));
      } else {
        await tx.insert(likesTable).values({ postId: id, userId });
      }
    });
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
        isMember: sql<boolean>`
          EXISTS (
            SELECT 1 FROM membersTable 
            WHERE membersTable.userId = usersTable.id
          )
        `,
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
        memberId: membersTable.userId,
      })
      .from(postsTable)
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .leftJoin(membersTable, eq(membersTable.groupId, groupsTable.id))
      .where(and(eq(postsTable.id, postId), eq(membersTable.userId, userId)));

    if (!result) {
      throw new NotFoundError("Post");
    }

    const { memberId } = result;

    if (!memberId) {
      throw new ForbiddenError();
    }
  }
}
