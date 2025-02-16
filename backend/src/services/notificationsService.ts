import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq, and, ne } from "drizzle-orm";
import {
  devicesTable,
  groupsTable,
  membersTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "../entities/schema";
import { Like, likeValidate } from "../entities/likes/validator";
import { Comment, commentValidate } from "../types/api/internal/comments";
import { Notification } from "../types/api/internal/notification";

/*
Questions for our tech leads
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
  notifyPost(post: Post): Promise<Notification[]>;

  /**
   * Alerts the post maker that someone has liked their post.
   * @param like a user liking a post
   */
  notifyLike(like: Like): Promise<Notification>;

  /**
   * Alerts the post maker that someone has commented on their post.
   * @param comment a user commenting on a post
   */
  notifyComment(comment: Comment): Promise<Notification>;
}

/**
 * A service that sends notifications to users when certain events occur. Like when a user
 * recieves a Like, Comment, or Posts.
 */
export class ExpoNotificationService implements INotificationService {
  private expo: Expo;
  private supabaseClient: SupabaseClient;
  private db: PostgresJsDatabase;

  constructor(config: Configuration, db: PostgresJsDatabase, expo: Expo) {
    this.expo = expo;
    this.supabaseClient = createClient(config.supabase.url, config.supabase.key);
    this.subscribeToPosts();
    this.subscribeToComments();
    this.subscribeToLikes();
    this.db = db;
  }

  private subscribeToPosts() {
    this.supabaseClient
      .channel("posts_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const post = postValidate.parse(payload.new);
        const postWithURL = {
          ...post,
          createdAt: new Date(post.createdAt),
        };
        this.notifyPost(postWithURL);
      })
      .subscribe();
  }

  private subscribeToComments() {
    this.supabaseClient
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const like: Like = likeValidate.parse(payload.new);
          this.notifyLike(like);
        },
      )
      .subscribe();
  }

  private subscribeToLikes() {
    this.supabaseClient
      .channel("likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        const comment: Comment = commentValidate.parse(payload.new);
        this.notifyComment(comment);
      })
      .subscribe();
  }

  // Will retry some thunk up to the given number of times
  retryOnError = async <T>(func: () => T, tries: number): Promise<T> => {
    if (tries <= 1) {
      return await func();
    } else {
      try {
        return await func();
      } catch (error) {
        return await this.retryOnError(func, tries - 1);
      }
    }
  };

  /**
   * Unsubscribe a user from notifications by setting their notificationsEnabled to false
   * @param userId the id of the user to unsubscribe
   */
  async unsubscribe(userId: string): Promise<void> {
    return this.retryOnError(async () => await this.unsubscriber(userId), 3);
  }

  private async unsubscriber(userId: string): Promise<void> {
    const user = await this.db
      .update(membersTable)
      .set({ notificationsEnabled: false })
      .where(eq(membersTable.userId, userId));

    if (!user) {
      throw new NotFoundError("User");
    }
  }

  /**
   * Notifies all group members of a new post.
   * @param post the new post that a user has made.
   */
  async notifyPost(post: Post): Promise<Notification[]> {
    return this.retryOnError(async () => await this.postNotifyer(post), 3);
  }

  private async postNotifyer(post: Post): Promise<Notification[]> {
    // Get the Group Id of the post maker
    const [posterGroupId] = await this.db
      .select({
        groupId: postsTable.groupId,
        name: usersTable.name,
        groupName: groupsTable.name,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .where(eq(groupsTable.id, post.groupId));

    if (!posterGroupId) {
      console.log(
        await this.db
          .select({
            groupId: postsTable.groupId,
            name: usersTable.name,
            groupName: groupsTable.name,
          })
          .from(postsTable)
          .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
          .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId)),
      );
      throw new NotFoundError("Unable to find the group! " + post.groupId);
    }

    // get the list of members who are in the group
    const members = await this.db
      .select({
        userId: membersTable.userId,
      })
      .from(membersTable)
      .where(
        and(
          //Check to make sure that the poster is not included
          ne(membersTable.userId, post.userId),
          eq(membersTable.groupId, posterGroupId.groupId),
        ),
      );

    if (!members) {
      throw new NotFoundError("Unable to find the other group memebers!");
    }
    let notifications: Notification[] = [];

    for (let member of members) {
      // Insert the notification into the database
      const res = await this.db
        .insert(notificationsTable)
        .values({
          actorId: post.userId,
          receiverId: member.userId,
          referenceType: "POST",
          groupId: post.groupId,
          postId: post.id,
          title: "New Post",
          description: `${posterGroupId.name} just posted in ${posterGroupId.groupName}`,
        })
        .returning();
      if (!res[0]) {
        throw new NotFoundError("Notification");
      }
      notifications.push(res[0]);
    }

    // TODO: make this into one query
    // Get the list of push tokens for the group members
    const messages: ExpoPushMessage[] = await Promise.all(
      members
        .filter(async (member) => await this.getNotificationEnabled(member.userId))
        .map(async (member) => ({
          to: await this.getPushToken(member.userId),
          sound: "default",
          body: "GET HYPE new group post",
          data: { post },
        })),
    );

    // Send the notifications and if all notifications off, empty list and none will send
    const chunks: ExpoPushMessage[][] = this.expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }

    return notifications;
  }

  /**
   * Alerts the post maker that someone has liked their post.
   * @param like a user liking a post
   */
  async notifyLike(like: Like): Promise<Notification> {
    return this.retryOnError(async () => await this.likeNotifyer(like), 3);
  }

  private async likeNotifyer(like: Like): Promise<Notification> {
    // Get the userId of the post maker
    const [userId] = await this.db
      .select({
        userId: postsTable.userId,
        name: usersTable.name,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
      .where(eq(postsTable.id, like.postId));

    if (userId === undefined) {
      throw new NotFoundError("UserId");
    }

    // Insert the notification into the database
    const [notification] = await this.db
      .insert(notificationsTable)
      .values({
        actorId: like.userId,
        receiverId: userId.userId,
        referenceType: "LIKE",
        likeId: like.id,
        postId: like.postId,
        title: "New Like",
        description: `${userId.name} liked your post`,
      })
      .returning();

    if (!notification) {
      throw new NotFoundError("Notification");
    }
    if (!this.getNotificationEnabled(userId.userId)) {
      return notification;
    }

    const token = await this.getPushToken(userId.userId);

    // TODO: CHANGE SCHEMA TO STORE PUSH TOKEN.
    const messages: ExpoPushMessage[] = [
      {
        to: token,
        sound: "default",
        body: "OOOHHHHH someone loved your post <3",
        data: { like },
      },
    ];

    const chunks = this.expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
    return notification;
  }

  /**
   * Alerts the post maker that someone has commented on their post.
   * @param comment a user commenting on a post
   */
  async notifyComment(comment: Comment): Promise<Notification> {
    return this.retryOnError(async () => await this.commentNotifyer(comment), 3);
  }

  private async commentNotifyer(comment: Comment): Promise<Notification> {
    // Get the userId of person whose post was commented on
    const [userId] = await this.db
      .select({
        userId: postsTable.userId,
        name: usersTable.name,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
      .where(eq(postsTable.id, comment.postId));

    if (userId === undefined) {
      throw new NotFoundError("UserId");
    }

    const [notification] = await this.db
      .insert(notificationsTable)
      .values({
        actorId: comment.userId,
        receiverId: userId.userId,
        referenceType: "COMMENT",
        commentId: comment.id,
        postId: comment.postId,
        title: "New Comment",
        description: `${userId.name} commented on your post`,
      })
      .returning();

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    if (!this.getNotificationEnabled(userId.userId)) {
      return notification;
    }

    const token = await this.getPushToken(userId.userId);

    const messages: ExpoPushMessage[] = [
      {
        to: token,
        sound: "default",
        body: "TALK TALK",
        data: { comment },
      },
    ];

    // Send the notification
    const chunks = this.expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
    return notification;
  }

  private async getNotificationEnabled(userId: string): Promise<boolean> {
    const [notificationsEnabled] = await this.db
      .select({
        notificationsEnabled: membersTable.notificationsEnabled,
      })
      .from(membersTable)
      .where(eq(membersTable.userId, userId));
    if (!notificationsEnabled) {
      throw new NotFoundError("Notifications Enabled");
    }
    return notificationsEnabled.notificationsEnabled;
  }

  private async getPushToken(userId: string): Promise<string> {
    const [token] = await this.db
      .select({
        token: devicesTable.token,
      })
      .from(devicesTable)
      .where(eq(devicesTable.userId, userId));
    if (!token) {
      throw new NotFoundError("Token");
    }
    return token.token;
  }
}
