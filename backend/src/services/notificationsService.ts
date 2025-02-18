import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { InternalServerError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq, and, ne, sql } from "drizzle-orm";
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
import {
  LikeCommentNotificationMetadata,
  Notification,
  PostNotificationMetadata,
} from "../types/api/internal/notification";
import logger from "../utilities/logger";
import { NotificationType } from "../constants/database";
import { handleServiceError } from "../utilities/errors/service-error";

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
  notifyLike(like: Like): Promise<Notification[]>;

  /**
   * Alerts the post maker that someone has commented on their post.
   * @param comment a user commenting on a post
   */
  notifyComment(comment: Comment): Promise<Notification[]>;
}

/**
 * A service that sends notifications to users when certain events occur. Like when a user
 * receives a Like, Comment, or Posts.
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

  private retryOnError = async (func: () => ExpoPushTicket[], tries: number): Promise<void> => {
    if (tries <= 1) {
      await func();
    } else {
      try {
        const response: ExpoPushTicket[] = await func();
        response.map((curr) => {
          if (curr.status === "error") {
            logger.error(`Error in sending a notification with the error: ${curr.message}`);
          }
        });
      } catch (error) {
        logger.error(error);
      }
    }
  };

  /**
   * Notifies all group members of a new post.
   * @param post the new post that a user has made.
   */
  async notifyPost(post: Post): Promise<Notification[]> {
    const { username, groupName, deviceTokens, memberIDs } = await this.getPostMetadata(post);

    const message = this.formatMessage(username, groupName, NotificationType.POST);

    const notifications: Notification[] = memberIDs.map((memberId) => ({
      actorId: post.userId,
      receiverId: memberId,
      referenceType: "POST",
      groupId: post.groupId,
      postId: post.id,
      title: "New Post",
      commentId: null,
      likeId: null,
      description: message,
    }));

    const insertedNotification = await this.insertNotificationToDB(notifications);

    await this.sendPushNotifications(deviceTokens, message, post);

    return insertedNotification;
  }

  private async getPostMetadata(post: Post): Promise<PostNotificationMetadata> {
    const getPostMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          username: usersTable.username,
          groupName: groupsTable.name,
          memberIDs: sql<string[]>`ARRAY_AGG(DISTINCT ${membersTable.userId})`,
          deviceTokens: sql<
            string[]
          >`ARRAY_AGG(DISTINCT CASE WHEN ${membersTable.notificationsEnabled}) THEN ${devicesTable.token} ELSE NULL END`,
        })
        .from(postsTable)
        .innerJoin(usersTable, eq(usersTable.id, post.userId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(membersTable, eq(membersTable.groupId, groupsTable.id))
        .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
        .where(and(eq(postsTable.id, post.id), ne(membersTable.userId, post.userId)))
        .groupBy(usersTable.username, groupsTable.name);

      if (!result) {
        throw new InternalServerError("Failed to retrieve post metadata");
      }
      return result;
    };
    return await handleServiceError(getPostMetadataImpl)();
  }

  /**
   * Alerts the post maker that someone has liked their post.
   * @param like a user liking a post
   */
  async notifyLike(like: Like): Promise<Notification[]> {
    const { userId, username, groupName, token, isEnabled } = await this.getLikeMetadata(like);

    const message = this.formatMessage(username, groupName, NotificationType.LIKE);

    const notification: Notification[] = [
      {
        actorId: like.userId,
        receiverId: userId,
        referenceType: "LIKE",
        likeId: like.id,
        postId: like.postId,
        title: "New Like",
        description: message,
      },
    ];

    const insertedNotification = await this.insertNotificationToDB(notification);

    if (isEnabled === false) {
      return insertedNotification;
    }

    await this.sendPushNotifications(token, message, like);

    return insertedNotification;
  }

  private async getLikeMetadata(like: Like): Promise<LikeCommentNotificationMetadata> {
    const getLikeMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          userId: postsTable.userId,
          username: usersTable.username,
          groupName: groupsTable.name,
          token: sql<string[]>`ARRAY_AGG(DISTINCT ${devicesTable.token})`,
          isEnabled: membersTable.notificationsEnabled,
        })
        .from(postsTable)
        .innerJoin(usersTable, eq(usersTable.id, like.userId))
        .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
        .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(likesTable, eq(likesTable.id, like.id))
        .where(and(eq(postsTable.id, like.postId), ne(postsTable.userId, like.userId)))
        .groupBy(likesTable.id, postsTable.userId, usersTable.username, groupsTable.name);

      if (!result) {
        throw new InternalServerError("Failed to retrieve like metadata");
      }
      return result;
    };
    return await handleServiceError(getLikeMetadataImpl)();
  }

  async notifyComment(comment: Comment): Promise<Notification[]> {
    const { userId, username, groupName, token, isEnabled } =
      await this.getCommentMetadata(comment);

    const message = this.formatMessage(username, groupName, NotificationType.COMMENT);

    const notification: Notification[] = [
      {
        actorId: comment.userId,
        receiverId: userId,
        referenceType: "COMMENT",
        commentId: comment.id,
        postId: comment.postId,
        title: "New Comment",
        likeId: null,
        description: message,
      },
    ];

    const insertedNotification = await this.insertNotificationToDB(notification);

    if (isEnabled === false) {
      return insertedNotification;
    }

    await this.sendPushNotifications(token, message, comment);

    return insertedNotification;
  }

  private async getCommentMetadata(comment: Comment): Promise<LikeCommentNotificationMetadata> {
    const getCommentMetadataImpl = async () => {
      const [result] = await this.db
        .select({
          userId: postsTable.userId,
          username: usersTable.username,
          groupName: groupsTable.name,
          isEnabled: membersTable.notificationsEnabled,
          token: sql<string[]>`ARRAY_AGG(DISTINCT ${devicesTable.token})`,
        })
        .from(postsTable)
        .innerJoin(devicesTable, eq(postsTable.userId, devicesTable.userId))
        .innerJoin(membersTable, eq(postsTable.groupId, membersTable.groupId))
        .innerJoin(usersTable, eq(usersTable.id, comment.userId))
        .innerJoin(groupsTable, eq(groupsTable.id, postsTable.groupId))
        .innerJoin(commentsTable, eq(commentsTable.id, comment.id))
        .where(and(eq(commentsTable.id, comment.id), ne(postsTable.userId, comment.userId)))
        .groupBy(
          postsTable.userId,
          usersTable.username,
          groupsTable.name,
          membersTable.notificationsEnabled,
        );

      if (!result) {
        throw new InternalServerError("Failed to retrieve comment metadata");
      }
      return result;
    };
    return await handleServiceError(getCommentMetadataImpl)();
  }

  private async sendPushNotifications(
    deviceTokens: string[],
    message: string,
    data: Comment | Like | Post,
  ) {
    const messages = this.formatExpoPushMessage(deviceTokens, message, data);
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
  }

  private formatMessage(username: string, groupName: string, type: NotificationType): string {
    let message: string;

    switch (type) {
      case NotificationType.COMMENT:
        message = `${username} commented on your post in ${groupName}!`;
        break;
      case NotificationType.LIKE:
        message = `${username} just liked your post in ${groupName}!`;
        break;
      case NotificationType.POST:
        message = `${username} just made a new post in ${groupName}!`;
        break;
      default:
        throw new Error("Invalid type");
    }
    return message;
  }

  private formatExpoPushMessage(
    deviceTokens: string[],
    message: string,
    data: Comment | Like | Post,
  ): ExpoPushMessage[] {
    return deviceTokens.map((token) => ({
      to: token,
      title: "✨ You got a new notification ✨",
      body: message,
      data,
      sound: "default",
    }));
  }

  private async insertNotificationToDB(notifications: Notification[]): Promise<Notification[]> {
    return await this.db.insert(notificationsTable).values(notifications).returning();
  }
}
