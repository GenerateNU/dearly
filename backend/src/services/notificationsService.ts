import { createClient, PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { createPostValidate, postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq } from "drizzle-orm";
import { groupsTable, likesTable, membersTable, postsTable } from "../entities/schema";
import { IDPayload } from "../types/id";
import { Like, likeValidate } from "../entities/likes/validator";
import { Comment, commentValidate } from "../types/api/internal/comments";

/*
Questions for our tech leads
- Where should we store our push tokens in the database (probably in the users table)
/**
 * POST: a new post is made in the group
 * LIKE: someone like your post
 * COMMENT: someone comments on your post
 */

export interface INotificationService {
  unsubscribe(pushToken: string): void;

  // instead of notify make post/comment/like methods for specificity??
  notifyPost(post: Post): Promise<void>;

  notifyLike(like: Like): Promise<void>;

  notifyComment(comment: Comment): Promise<void>;
}

export class ExpoNotificationService implements INotificationService {
  private expo = new Expo();
  private supabaseClient: SupabaseClient;
  private db: PostgresJsDatabase;
  constructor(config: Configuration, db: PostgresJsDatabase) {
    this.supabaseClient = createClient(config.supabase.url, config.supabase.key);

    this.supabaseClient
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const post: Post = postValidate.parse(payload.new);
        this.notifyPost(post);
      })
      .subscribe();

    this.supabaseClient
      .channel("likeComments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likeComments" },
        (payload) => {
          const like: Like = likeValidate.parse(payload.new);
          this.notifyLike(like);
        },
      )
      .subscribe();

    this.supabaseClient
      .channel("likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        const comment: Comment = commentValidate.parse(payload.new);
        this.notifyComment(comment);
      })
      .subscribe();

    this.db = db;
  }

  async subscribe(userId: string, pushToken: string): Promise<void> {
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(); // need to create this error
    }

    try {
      await this.supabaseClient
        .from("users")
        .update({ pushToken: pushToken })
        .eq("id", userId)
        .select();
    } catch (error) {
      throw new Error(); // need to create this error
    }
  }

  // Unsubscribe a user (remove push token)
  // if the user has a token, update it to given token
  async unsubscribe(userId: string): Promise<void> {
    let result;
    try {
      result = await this.supabaseClient
        .from("users")
        .update({ pushToken: null })
        .eq("id", userId)
        .select();
    } catch (error) {
      throw new NotFoundError("User");
    }
  }

  // Send a notification to all members of the person's group
  async notifyPost(post: Post): Promise<void> {
    try {
      // Get the Group Id of the post maker
      const [posterGroupId] = await this.db
        .select({
          groupId: postsTable.groupId,
        })
        .from(postsTable)
        .where(eq(groupsTable.id, post.id));

      if (posterGroupId === undefined) {
        throw new NotFoundError("Group");
      }

      // get the list of members who are in the group
      const members = await this.db
        .select({
          groupId: membersTable.groupId,
          userId: membersTable.userId,
          joinedAt: membersTable.joinedAt,
          role: membersTable.role,
        })
        .from(membersTable)
        .where(eq(membersTable.groupId, posterGroupId.groupId));

      if (members === undefined) {
        throw new NotFoundError("Group Members");
      }

      // TODO: CHANGE SCHEMA TO STORE PUSH TOKEN.
      const messages: ExpoPushMessage[] = members.map((member) => ({
        to: member.userId,
        sound: "default",
        body: "New post in your group!",
        data: { post },
      }));

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (Error) {
      throw new NotFoundError("Supabase Issue"); // need to create this error
    }
  }

  async notifyLike(like: Like): Promise<void> {
    try {
      // Get the userId of the post maker
      const [userId] = await this.db
        .select({
          userId: postsTable.userId,
        })
        .from(postsTable)
        .where(eq(postsTable.id, like.postId));

      if (userId === undefined) {
        throw new NotFoundError("UserId");
      }

      // TODO: CHANGE SCHEMA TO STORE PUSH TOKEN.
      const messages: ExpoPushMessage[] = [
        {
          to: userId.userId,
          sound: "default",
          body: "Someone liked your post!",
          data: { like },
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (Error) {
      throw new NotFoundError("Supabase Issue"); // need to create this error
    }
  }

  async notifyComment(comment: Comment): Promise<void> {
    try {
      // Get the userId of person whose post was commented on
      const [userId] = await this.db
        .select({
          userId: postsTable.userId,
        })
        .from(postsTable)
        .where(eq(postsTable.id, comment.postId));

      if (userId === undefined) {
        throw new NotFoundError("UserId");
      }

      // TODO: CHANGE SCHEMA TO STORE PUSH TOKEN.
      const messages: ExpoPushMessage[] = [
        {
          to: userId.userId,
          sound: "default",
          body: "Someone liked your post!",
          data: { comment },
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (Error) {
      throw new NotFoundError("Supabase Issue"); // need to create this error
    }
  }
}
