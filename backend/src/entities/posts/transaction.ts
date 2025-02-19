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
import { eq, and, sql, count } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { IDPayload } from "../../types/id";
import {
  CreatePostPayload,
  PostWithMedia,
  UpdatePostPayload,
} from "../../types/api/internal/posts";
import { getPostMetadata } from "../../utilities/query";

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
      location: post.location,
    };
    const mediaPayload = post.media;

    const postWithMedia = await this.db.transaction(async (tx) => {
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

      // insert media with explicit order
      const insertedMedia = mediaPayload?.length
        ? await tx
            .insert(mediaTable)
            .values(
              mediaPayload.map((media, index) => ({
                postId: newPost.id,
                ...media,
                order: index,
              })),
            )
            .returning()
        : [];

      // fetch user profile photo using JOIN
      const [user] = await tx
        .select({
          profilePhoto: usersTable.profilePhoto,
          name: usersTable.name,
          username: usersTable.username,
        })
        .from(usersTable)
        .where(eq(usersTable.id, newPost.userId));

      if (!user) {
        return null;
      }

      return {
        id: newPost.id,
        userId: newPost.userId,
        groupId: newPost.groupId,
        caption: newPost.caption,
        createdAt: newPost.createdAt,
        name: user.name,
        username: user.username,
        media: insertedMedia.sort((a, b) => a.order - b.order), // Ensure order is correct
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
      .select(getPostMetadata(userId))
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .leftJoin(mediaTable, eq(postsTable.id, mediaTable.postId))
      .innerJoin(groupsTable, eq(postsTable.groupId, groupsTable.id))
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
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
        postsTable.location,
        usersTable.profilePhoto,
        usersTable.name,
        usersTable.username,
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
    location,
  }: UpdatePostPayload): Promise<PostWithMedia | null> {
    await this.checkPostOwnership(id, userId);

    const updatedPostWithMedia = await this.db.transaction(async (tx) => {
      // update post caption and location
      const [updatedPost] = await tx
        .update(postsTable)
        .set({ caption, location })
        .where(and(eq(postsTable.id, id), eq(postsTable.userId, userId)))
        .returning();

      if (!updatedPost) return null;

      let updatedMedia = [];
      if (media?.length) {
        // delete old media
        await tx.delete(mediaTable).where(eq(mediaTable.postId, id));

        // insert new media with order
        updatedMedia = await tx
          .insert(mediaTable)
          .values(
            media.map((m, index) => ({
              postId: updatedPost.id,
              ...m,
              order: index, // maintain order
            })),
          )
          .returning();
      } else {
        updatedMedia = await tx
          .select()
          .from(mediaTable)
          .where(eq(mediaTable.postId, updatedPost.id))
          .orderBy(mediaTable.order); // ensure order is maintained
      }

      // fetch updated likes, comments, and profile photo using JOIN
      const [post] = await tx
        .select({
          comments: count(commentsTable.id),
          likes: count(likesTable.id),
          isLiked: sql<boolean>`BOOL_OR(CASE WHEN ${likesTable.userId} = ${userId} THEN true ELSE false END)`,
          profilePhoto: usersTable.profilePhoto,
          name: usersTable.name,
          username: usersTable.username,
        })
        .from(postsTable)
        .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
        .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
        .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
        .where(eq(postsTable.id, id))
        .groupBy(postsTable.id, usersTable.profilePhoto, usersTable.name, usersTable.username);

      if (!post) return null;

      return {
        id: updatedPost.id,
        userId: updatedPost.userId,
        groupId: updatedPost.groupId,
        caption: updatedPost.caption,
        createdAt: updatedPost.createdAt,
        location: updatedPost.location,
        media: updatedMedia.sort((a, b) => a.order - b.order), // Ensure media order
        comments: post.comments,
        likes: post.likes,
        isLiked: post.isLiked,
        profilePhoto: post.profilePhoto,
        name: post.name,
        username: post.username,
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
