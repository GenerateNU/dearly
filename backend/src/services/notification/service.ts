import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { Post, postValidate } from "../../types/api/internal/posts";
import { Comment, commentValidate } from "../../types/api/internal/comments";
import { Notification } from "../../types/api/internal/notification";
import { NotificationType } from "../../constants/database";
import { Like, likeValidate } from "../../types/api/internal/like";
import { PushNotificationService } from "./expo";
import { NotificationTransaction } from "./transaction";

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

  /**
   * Subscribe to supabase event
   */
  subscribeToSupabaseRealtime(): void;

  /**
   * Unsubscribe to supabase event
   */
  unsubscribeSupabaseRealtime(): void;
}

/**
 * A service that sends notifications to users when certain events occur. Like when a user
 * receives a Like, Comment, or Posts.
 */
export class ExpoNotificationService implements NotificationService {
  private expoService: PushNotificationService;
  private supabaseClient: SupabaseClient;
  private transaction: NotificationTransaction;
  private postChannel: RealtimeChannel | null;
  private likeChannel: RealtimeChannel | null;
  private commentChannel: RealtimeChannel | null;

  constructor(
    client: SupabaseClient,
    transaction: NotificationTransaction,
    expo: PushNotificationService,
  ) {
    this.expoService = expo;
    this.supabaseClient = client;
    this.transaction = transaction;
    this.postChannel = null;
    this.likeChannel = null;
    this.commentChannel = null;
  }

  async notifyPost(post: Post): Promise<Notification[]> {
    const data = await this.transaction.getPostMetadata(post);
    console.log(data)

    if (!data) return [];

    const { username, groupName, deviceTokens, memberIDs } = data;

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
      createdAt: new Date(),
    }));

    console.log(JSON.stringify(notifications))

    const insertedNotification = await this.transaction.insertNotifications(notifications);

    if (insertedNotification.length == notifications.length) {
      await this.expoService.sendPushNotifications({ deviceTokens, message, data: post });
    }

    return insertedNotification;
  }

  async notifyComment(comment: Comment): Promise<Notification[]> {
    const data = await this.transaction.getCommentMetadata(comment);

    if (!data) return [];

    const { userId, username, groupName, deviceTokens, isEnabled, groupId } = data;

    const message = this.formatMessage(username, groupName, NotificationType.COMMENT);

    const notifications: Notification[] = [
      {
        actorId: comment.userId,
        receiverId: userId,
        referenceType: "COMMENT",
        commentId: comment.id,
        postId: comment.postId,
        title: "New Comment",
        groupId,
        likeId: null,
        description: message,
        createdAt: new Date(),
      },
    ];

    const insertedNotification = await this.transaction.insertNotifications(notifications);

    // Early return only if there are conflicts (This does not account for if some notifications are accounted for.)
    if (isEnabled === false) {
      return insertedNotification;
    }

    if (insertedNotification.length == notifications.length) {
      await this.expoService.sendPushNotifications({ deviceTokens, message, data: comment });
    }

    return insertedNotification;
  }

  async notifyLike(like: Like): Promise<Notification[]> {
    const data = await this.transaction.getLikeMetadata(like);

    if (!data) return [];

    const { userId, username, groupName, deviceTokens, isEnabled, groupId } = data;

    const message = this.formatMessage(username, groupName, NotificationType.LIKE);

    const notifications: Notification[] = [
      {
        actorId: like.userId,
        receiverId: userId,
        referenceType: "LIKE",
        likeId: like.id,
        groupId,
        postId: like.postId,
        title: "New Like",
        description: message,
        createdAt: new Date(),
      },
    ];

    const insertedNotification = await this.transaction.insertNotifications(notifications);

    if (isEnabled === false) {
      return insertedNotification;
    }

    if (insertedNotification.length == notifications.length) {
      await this.expoService.sendPushNotifications({ deviceTokens, message, data: like });
    }

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

  public subscribeToSupabaseRealtime() {
    this.subscribeToPosts();
    this.subscribeToComments();
    this.subscribeToLikes();
  }

  public unsubscribeSupabaseRealtime() {
    if (this.postChannel) {
      this.postChannel.unsubscribe();
    }
    if (this.likeChannel) {
      this.likeChannel.unsubscribe();
    }
    if (this.commentChannel) {
      this.commentChannel.unsubscribe();
    }
  }

  private subscribeToPosts() {
    this.postChannel = this.supabaseClient
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
    this.commentChannel = this.supabaseClient
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
    this.likeChannel = this.supabaseClient
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
