import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq } from "drizzle-orm";
import {
  groupsTable,
  membersTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "../entities/schema";
import { Like, likeValidate } from "../entities/likes/validator";
import { Comment, commentValidate } from "../types/api/internal/comments";

/*
Questions for our tech leads
- how to mock the expo push notifications
- **use spy (in help folder) to mock the expo push notifications
  - Mai: we don't put it in notification table because we want users to be able to turn on/off for a specific group
    Also, you guys don't need to worry about registering device tokens since the frontend is handling that,
    which implies we won't need to import from expo-device, expo-notifications, expo-constants, react-native
    since they are frontend libraries and won't work in the backend!
*/

export interface INotificationService {
  /**
   * Unsubscribe a user from notifications by setting their notificationsEnabled to false
   * @param userId the id of the user to unsubscribe
   */
  unsubscribe(userId: string): void;

  /**
   * Notifies all group members of a new post.
   * @param post the new post that a user has made.
   */
  notifyPost(post: Post): Promise<void>;

  /**
   * Alerts the post maker that someone has liked their post.
   * @param like a user liking a post
   */
  notifyLike(like: Like): Promise<void>;

  /**
   * Alerts the post maker that someone has commented on their post.
   * @param comment a user commenting on a post
   */
  notifyComment(comment: Comment): Promise<void>;
}

/**
 * A service that sends notifications to users when certain events occur.
 */
export class ExpoNotificationService implements INotificationService {
  private expo = new Expo();
  private supabaseClient: SupabaseClient;
  private db: PostgresJsDatabase;

  constructor(config: Configuration, db: PostgresJsDatabase) {
    this.supabaseClient = createClient(config.supabase.url, config.supabase.key);

    this.supabaseClient
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const post: Post = postValidate.parse(payload);
        this.notifyPost(post);
      })
      .subscribe();

    this.supabaseClient
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const like: Like = likeValidate.parse(payload);
          this.notifyLike(like);
        },
      )
      .subscribe();

    this.supabaseClient
      .channel("likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        const comment: Comment = commentValidate.parse(payload);
        this.notifyComment(comment);
      })
      .subscribe();

    this.db = db;
  }

  async unsubscribe(userId: string): Promise<void> {
    try {
      const user = await this.db
        .update(usersTable)
        .set({ notificationsEnabled: false })
        .where(eq(usersTable.id, userId));

      if (!user) {
        throw new NotFoundError("User");
      }
    } catch (error) {
      throw new NotFoundError("User");
    }
  }

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
        body: "GET HYPE new group post >_<",
        data: { post },
      }));

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }

      for (let member of members) {
        // Insert the notification into the database
        await this.db.insert(notificationsTable).values({
          actorId: post.userId,
          receiverId: member.userId,
          referenceType: "POST",
          postId: post.id,
          title: "New Post",
          description: "Someone posted in your group",
        });
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
          body: "OOOHHHHH someone loved your post <3",
          data: { like },
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }

      // Insert the notification into the database
      await this.db.insert(notificationsTable).values({
        actorId: like.userId,
        receiverId: userId.userId,
        referenceType: "LIKE",
        likeId: like.id,
        postId: like.postId,
        title: "New Like",
        description: "Someone liked your post",
      });
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
          body: "TALK TALK",
          data: { comment },
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }

      // Insert the notification into the database
      await this.db.insert(notificationsTable).values({
        actorId: comment.userId,
        receiverId: userId.userId,
        referenceType: "COMMENT",
        commentId: comment.id,
        postId: comment.postId,
        title: "New Comment",
        description: "Someone commented on your post",
      });
    } catch (Error) {
      throw new NotFoundError("Supabase Issue"); // need to create this error
    }
  }
}
