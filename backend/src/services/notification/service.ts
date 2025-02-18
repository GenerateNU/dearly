import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Configuration } from "../../types/config";
import { postValidate } from "../../entities/posts/validator";
import { Post } from "../../types/api/internal/posts";
import { Comment, commentValidate } from "../../types/api/internal/comments";
import { Notification } from "../../types/api/internal/notification";
import { NotificationType } from "../../constants/database";
import { Like } from "../../types/api/internal/like";
import { ExpoPushService, PushNotificationService } from "./expo";
import { NotificationTransaction } from "./transaction";
import { likeValidate } from "../../entities/likes/validator";

export interface NotificationService {
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
export class ExpoNotificationService implements NotificationService {
  private expoService: PushNotificationService;
  private supabaseClient: SupabaseClient;
  private transaction: NotificationTransaction;

  constructor(config: Configuration, transaction: NotificationTransaction, expo: ExpoPushService) {
    this.expoService = expo;
    this.supabaseClient = createClient(config.supabase.url, config.supabase.key);
    this.subscribeToSupabaseRealTime();
    this.transaction = transaction;
  }

  /**
   * Notifies all group members of a new post.
   * @param post the new post that a user has made.
   */
  async notifyPost(post: Post): Promise<Notification[]> {
    const { username, groupName, deviceTokens, memberIDs } =
      await this.transaction.getPostMetadata(post);

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

    const insertedNotification = await this.transaction.insertNotifications(notifications);

    await this.expoService.sendPushNotifications(deviceTokens, message, post);

    return insertedNotification;
  }

  async notifyComment(comment: Comment): Promise<Notification[]> {
    const { userId, username, groupName, token, isEnabled } =
      await this.transaction.getCommentMetadata(comment);

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

    const insertedNotification = await this.transaction.insertNotifications(notification);

    if (isEnabled === false) {
      return insertedNotification;
    }

    await this.expoService.sendPushNotifications(token, message, comment);

    return insertedNotification;
  }

  async notifyLike(like: Like): Promise<Notification[]> {
    const { userId, username, groupName, token, isEnabled } =
      await this.transaction.getLikeMetadata(like);

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

    const insertedNotification = await this.transaction.insertNotifications(notification);

    if (isEnabled === false) {
      return insertedNotification;
    }

    await this.expoService.sendPushNotifications(token, message, like);

    return insertedNotification;
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

  private subscribeToSupabaseRealTime() {
    this.subscribeToPosts();
    this.subscribeToComments();
    this.subscribeToLikes();
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
}
