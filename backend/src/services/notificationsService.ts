import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { postValidate } from "../entities/posts/validator";
import { Post } from "../types/api/internal/posts";
import { eq } from "drizzle-orm";
import { groupsTable, membersTable, postsTable } from "../entities/schema";
import { Like, likeValidate } from "../entities/likes/validator";
import { Comment, commentValidate } from "../types/api/internal/comments";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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

  subscribe(userId: string): void;

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

  /**
   * Subscribes a user to push notifications (when they get the popup, fill in their data with their push token)
   * @param userId id of the user
   * @param pushToken the expoId that is generated when the user allows push notifications
   */
  async subscribe(userId: string): Promise<void> {
    function handleRegistrationError(errorMessage: string) {
      alert(errorMessage);
      throw new Error(errorMessage);
    }

    let pushToken: string = "undefined";

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        handleRegistrationError("Permission not granted to get push token for push notification!");
        return;
      }

      //Project id: 767a3d1e-0356-4d65-92f1-ea095dc722ea
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.extra.expo.projectId,
          })
        ).data;
        console.log(pushTokenString);
        pushToken = pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError("Must use physical device for push notifications");
    }

    if (pushToken === "undefined") {
      handleRegistrationError("Push token not found");
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

  async unsubscribe(userId: string): Promise<void> {
    try {
      await this.supabaseClient.from("users").update({ pushToken: null }).eq("id", userId).select();
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
