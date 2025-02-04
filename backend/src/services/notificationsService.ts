import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Expo from "expo-server-sdk";
import { NotFoundError } from "../utilities/errors/app-error";
import { Configuration } from "../types/config";

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
  notifyPost(title: string, message: string): Promise<void>;

  notifyLike(title: string, message: string): Promise<void>;

  notifyComment(title: string, message: string): Promise<void>;
}


export class ExpoNotificationService implements INotificationService {
    
  private expo = new Expo();
  private supabaseClient : SupabaseClient;

  constructor(config: Configuration) {
    this.supabaseClient = createClient(config.supabase.url, config.supabase.key);

    this.supabaseClient
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        this.notifyPost(payload);
      })
      .subscribe();
      this.supabaseClient
      .channel("likeComments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likeComments" },
        (payload) => {
          this.notifyLike();
        },
      )
      .subscribe();

      this.supabaseClient
      .channel("likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        this.notifyComment();
      })
      .subscribe();
  }

  // Subscribe a user (store push token)
  // if the user has a token, update it to given token
  // if the user has null token, update it to given token.
  // if the user has a token already, update it to the given token
  // if the user is not found, throw error
  // if the push token is invalid, throw error
  async subscribe(userId: string, pushToken: string): Promise<void> {
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(); // need to create this error
    }

    try {
      await this.supabaseClient.from("users").update({ pushToken: pushToken }).eq("id", userId).select();
    } catch (error) {
      throw new Error(); // need to create this error
    }
  }

  // Unsubscribe a user (remove push token)
  // if the user has a token, update it to given token
  async unsubscribe(userId: string): Promise<void> {
    let result;
    try {
      result = await this.supabaseClient.from("users").update({ pushToken: null }).eq("id", userId).select();
    } catch (error) {
      throw new NotFoundError("User");
    }
  }

  // Send a notification to all members of the person's group
  async notifyPost(payload: any): Promise<Notification | undefined> {
    return undefined;
    // try {
    //   let [postsTable] = payload.record;

    //   let groupId = await this.supabaseClient.from("posts").select("groupId").eq("id", postsTable.id).select();

    //   let  groupMembers = await this.supabaseClient
    //     .from("members")
    //     .select("userId")
    //     .eq("groupId", groupId)
    //     .neq("userId", "posts.userId");

    //   // Save notification in the database
    //   // createNotification();

    //     const chunks = this.expo.chunkPushNotifications(
    //     for (let group of groupMembers) {
    //       await this.expo.sendPushNotificationsAsync(chunk);
    //     }
    //   } catch (error) {
    //     throw new PushTokenError();
    //   }

    //   return undefined;
  }
}
