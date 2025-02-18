import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq, and, ne } from "drizzle-orm";
import {
  commentsTable,
  devicesTable,
  groupsTable,
  likesTable,
  membersTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "../entities/schema";
import { Like, likeValidate } from "../entities/likes/validator";
import { Comment, commentValidate } from "../types/api/internal/comments";
import { Notification, partialNotification } from "../types/api/internal/notification";

export interface INotificationService {
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
      .channel("likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        const like = likeValidate.parse(payload.new);
        const likeWithDate = {
          ...like,
          createdAt: new Date(like.createdAt),
        };
        this.notifyLike(likeWithDate);
      })
      .subscribe();
  }

  private subscribeToLikes() {
    this.supabaseClient
      .channel("comment")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const comment = commentValidate.parse(payload.new);
          const commentWithDate = {
            ...comment,
            createdAt: new Date(comment.createdAt),
            voiceMemo: comment.voiceMemo ?? null,
          };
          this.notifyComment(commentWithDate);
        },
      )
      .subscribe();
  }

  // Will retry some thunk up to the given number of times
  //TODO: This is just an idea, this will not work however because these methods have side effects on the DB
  // We should only wrap the atempt to send a message.
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
      .innerJoin(usersTable, eq(usersTable.id, post.userId))
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .where(eq(groupsTable.id, post.groupId));

    if (!posterGroupId) {
      throw new NotFoundError("Group", "Unable to find the group of the poster!");
    }

    // get the list of members who are in the group
    const members = await this.db
      .select({
        userId: membersTable.userId,
        token: devicesTable.token,
        notificationsEnabled: membersTable.notificationsEnabled,
      })
      .from(membersTable)
      .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
      .where(
        and(
          //Check to make sure that the poster is not included
          ne(membersTable.userId, post.userId),
          eq(membersTable.groupId, posterGroupId.groupId),
        ),
      );

    if (!members) {
      throw new NotFoundError("Members", "Unable to find the other group members!");
    }

    if (members.length === 0) {
      return [];
    }

    const notifications: partialNotification[] = [];

    // create a list of notifications for each member
    for (let member of members) {
      const res: partialNotification = {
        actorId: post.userId,
        receiverId: member.userId,
        referenceType: "POST",
        groupId: post.groupId,
        postId: post.id,
        title: "New Post",
        description: `${posterGroupId.name} just posted in ${posterGroupId.groupName}`,
      };
      notifications.push(res);
    }

    // Insert the notification into the database
    const notifs = await this.db.insert(notificationsTable).values(notifications).returning();

    // Get the list of push tokens for the group members
    const messages: ExpoPushMessage[] = members
      .filter((member) => member.notificationsEnabled)
      .map((member: { userId: string; token: string }) => ({
        to: member.token,
        sound: "default",
        body: `${posterGroupId.name} just posted a new post in ${posterGroupId.groupName}!`,
        data: { post },
      }));

    this.chunkPushNotifications(messages);

    return notifs;
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
        likeId: likesTable.id,
        userId: postsTable.userId,
        name: usersTable.name,
        groupName: groupsTable.name,
        token: devicesTable.token,
        isEnabled: membersTable.notificationsEnabled,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(usersTable.id, like.userId))
      .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
      .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .innerJoin(likesTable, eq(likesTable.id, like.id))
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
        description: `${userId.name} just liked your post in ${userId.groupName}`,
      })
      .returning();

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    if (userId.isEnabled === false) {
      return notification;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: userId.token,
        sound: "default",
        body: `${userId.name} just liked your post in ${userId.groupName}!`,
        data: { like },
      },
    ];

    this.chunkPushNotifications(messages);

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
        commentId: commentsTable.id,
        userId: postsTable.userId,
        token: devicesTable.token,
        name: usersTable.name,
        groupName: groupsTable.name,
        isEnabled: membersTable.notificationsEnabled,
      })
      .from(postsTable)
      .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
      .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
      .innerJoin(usersTable, eq(usersTable.id, comment.userId))
      .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
      .innerJoin(commentsTable, eq(commentsTable.id, comment.id))
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
        description: `${userId.name} commented on your post in Group: ${userId.groupName}!`,
      })
      .returning();

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    if (userId.isEnabled === false) {
      return notification;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: userId.token,
        sound: "default",
        body: `${userId.name} just commented on your post in ${userId.groupName}!`,
        data: { comment },
      },
    ];

    // Send the notification
    this.chunkPushNotifications(messages);

    return notification;
  }

  private async chunkPushNotifications(messages: ExpoPushMessage[]) {
    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (error) {
      throw new Error("Error sending push notifications");
    }
  }
}
