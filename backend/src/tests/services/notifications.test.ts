import { NotificationConfig } from "./../../types/api/internal/notification";
import { getConfigurations } from "../../config/init";
import { connectDB } from "../../database/connect";
import {
  FULL_SNAPPER_POST_EXAMPLE,
  GROUP_FULL_SNAPPER_ID,
  JOSH_COMMENT_POST,
  JOSH_DEVICE_TOKEN,
  JOSH_LIKE_POST,
  LIKE_EXAMPLE,
  MAI_DEVICE_TOKEN,
  NUBS_DEVICE_TOKEN,
  POST_EXAMPLE,
  SINGLE_COMMENT,
  SNAPPER_GROUP_ID,
  USER_Josh_ID,
  USER_MAI_ID,
  USER_Nubs_ID,
} from "./../helpers/test-constants";
import { eq } from "drizzle-orm";
import { describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { notificationsTable } from "../../entities/schema";
import { resetDB } from "../../database/reset";
import { seedDatabase } from "../helpers/seed-db";
import {
  chunkPushNotificationsSpy,
  expo,
  sendPushNotificationsAsyncSpy,
  startTestApp,
} from "../helpers/test-app";
import { automigrateDB } from "../../database/migrate";
import { ExpoNotificationService } from "../../services/notification/service";
import { NotificationTransactionImpl } from "../../services/notification/transaction";
import { ExpoPushService } from "../../services/notification/expo";
import { TestBuilder } from "../helpers/test-builder";
import { Hono } from "hono";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID } from "../helpers/test-token";
import { SupabaseClient } from "@supabase/supabase-js";

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const transaction = new NotificationTransactionImpl(db);

  const notifService = new ExpoNotificationService(
    new SupabaseClient("supabase_url", "supabase_key"),
    transaction,
    new ExpoPushService(expo),
  );

  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    await automigrateDB(db, config);
    app = await startTestApp();
  });

  beforeEach(async () => {
    await resetDB(db);
    await seedDatabase(db);
    sendPushNotificationsAsyncSpy.mockClear();
    chunkPushNotificationsSpy.mockClear();
  });

  it("notifyPost: should insert and notify for one user", async () => {
    await notifService.notifyPost(POST_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, POST_EXAMPLE.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(USER_Nubs_ID);
    expect(results[0]?.receiverId).not.toBe(POST_EXAMPLE.userId);

    // Josh did not receive notification since he's the poster
    await sendPushNotificationCalled(1, [
      {
        to: NUBS_DEVICE_TOKEN,
        title: "✨ You got a new notification ✨",
        body: "josh just made a new post in snapper!",
        data: POST_EXAMPLE,
        sound: "default",
      },
    ]);
  });

  it("should query the database correctly for post", async () => {
    const result = await transaction.getPostMetadata(POST_EXAMPLE);

    expect(result).toEqual({
      username: "josh",
      groupName: "snapper",
      memberIDs: [USER_Nubs_ID],
      deviceTokens: [NUBS_DEVICE_TOKEN],
    });
  });

  it("notifyPost: should insert and notify for a larger group", async () => {
    await notifService.notifyPost(FULL_SNAPPER_POST_EXAMPLE);

    // assert that there are 3 new notifications inserted into notification table
    await assertNotificationLength(FULL_SNAPPER_POST_EXAMPLE.userId, 3);

    // Stone did not receive notification since he's the poster
    const tokens = [MAI_DEVICE_TOKEN, NUBS_DEVICE_TOKEN, JOSH_DEVICE_TOKEN];
    await sendPushNotificationCalled(
      1,
      tokens.map((token) => ({
        to: token,
        title: "✨ You got a new notification ✨",
        body: "theRock just made a new post in eng snapper!",
        data: FULL_SNAPPER_POST_EXAMPLE,
        sound: "default",
      })),
    );
  });

  it("should query the database correctly for post for large group", async () => {
    const result = await transaction.getPostMetadata(FULL_SNAPPER_POST_EXAMPLE);

    expect(result).toEqual({
      username: "theRock",
      groupName: "eng snapper",
      // exactly three users should receive notifications
      memberIDs: [USER_Josh_ID, USER_MAI_ID, USER_Nubs_ID],
      deviceTokens: [MAI_DEVICE_TOKEN, NUBS_DEVICE_TOKEN, JOSH_DEVICE_TOKEN],
    });
  });

  it("notifyPost: should insert and notify for a larger group with notification disabled", async () => {
    // Mai turned off notification for group
    await updateNotificationConfig(GROUP_FULL_SNAPPER_ID, USER_MAI_ID, {
      postNotificationEnabled: false,
    });

    // check if database query is correct
    const result = await transaction.getPostMetadata(FULL_SNAPPER_POST_EXAMPLE);

    expect(result).toEqual({
      username: "theRock",
      groupName: "eng snapper",
      memberIDs: [USER_Josh_ID, USER_MAI_ID, USER_Nubs_ID],
      deviceTokens: [NUBS_DEVICE_TOKEN, JOSH_DEVICE_TOKEN],
    });

    await notifService.notifyPost(FULL_SNAPPER_POST_EXAMPLE);

    await assertNotificationLength(FULL_SNAPPER_POST_EXAMPLE.userId, 3);

    // only send notification to Nubs and Josh without Mai
    const tokens = [NUBS_DEVICE_TOKEN, JOSH_DEVICE_TOKEN];

    await sendPushNotificationCalled(
      1,
      tokens.map((token) => ({
        to: token,
        title: "✨ You got a new notification ✨",
        body: "theRock just made a new post in eng snapper!",
        data: FULL_SNAPPER_POST_EXAMPLE,
        sound: "default",
      })),
    );
  });

  it("notifyLike: should insert and notify - like another user post", async () => {
    await notifService.notifyLike(LIKE_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, LIKE_EXAMPLE.userId));

    expect(results.length).toBe(1);

    expect(results[0]?.actorId).toBe(LIKE_EXAMPLE.userId);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);

    await sendPushNotificationCalled(1, [
      {
        to: JOSH_DEVICE_TOKEN,
        title: "✨ You got a new notification ✨",
        body: "nubs just liked your post in snapper!",
        data: LIKE_EXAMPLE,
        sound: "default",
      },
    ]);
  });

  it("should query the database correctly for like", async () => {
    const result = await transaction.getLikeMetadata(LIKE_EXAMPLE);

    expect(result).toEqual({
      username: "nubs",
      groupName: "snapper",
      userId: USER_Josh_ID,
      groupId: SNAPPER_GROUP_ID,
      isEnabled: true,
      deviceTokens: [JOSH_DEVICE_TOKEN],
    });
  });

  it("notifyLike: Should insert and notify - like their own post", async () => {
    await notifService.notifyLike(JOSH_LIKE_POST);
    const result = await transaction.getLikeMetadata(JOSH_LIKE_POST);
    expect(result).toBeNull();
    await assertNotificationLength(JOSH_LIKE_POST.userId, 0);
    await sendPushNotificationCalled(0);
  });

  it("notifyComment: should insert and notify - comment on another user post", async () => {
    await notifService.notifyComment(SINGLE_COMMENT);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, SINGLE_COMMENT.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);
    expect(results[0]?.actorId).toBe(SINGLE_COMMENT.userId);

    await sendPushNotificationCalled(1, [
      {
        to: JOSH_DEVICE_TOKEN,
        title: "✨ You got a new notification ✨",
        body: "nubs commented on your post in snapper!",
        data: SINGLE_COMMENT,
        sound: "default",
      },
    ]);
  });

  it("should query the database correctly for comment", async () => {
    const result = await transaction.getCommentMetadata(SINGLE_COMMENT);

    expect(result).toEqual({
      username: "nubs",
      groupName: "snapper",
      userId: USER_Josh_ID,
      groupId: SNAPPER_GROUP_ID,
      isEnabled: true,
      deviceTokens: [JOSH_DEVICE_TOKEN],
    });
  });

  it("notifyComment: Should insert and notify - comment on their own post", async () => {
    await notifService.notifyComment(JOSH_COMMENT_POST);
    const result = await transaction.getCommentMetadata(JOSH_COMMENT_POST);
    expect(result).toBeNull();
    await assertNotificationLength(JOSH_COMMENT_POST.userId, 0);
    await sendPushNotificationCalled(0);
  });

  it("notifyLike: should insert and notify - like another user post - notification disabled", async () => {
    // Josh turned off notification
    await updateNotificationConfig(SNAPPER_GROUP_ID, USER_Josh_ID, {
      likeNotificationEnabled: false,
    });

    await notifService.notifyLike(LIKE_EXAMPLE);

    // notification disabled
    const result = await transaction.getLikeMetadata(LIKE_EXAMPLE);
    expect(result).toEqual({
      username: "nubs",
      groupName: "snapper",
      userId: USER_Josh_ID,
      groupId: SNAPPER_GROUP_ID,
      isEnabled: false,
      deviceTokens: [JOSH_DEVICE_TOKEN],
    });

    // insert notfication table
    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, LIKE_EXAMPLE.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.actorId).toBe(LIKE_EXAMPLE.userId);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);

    // but do not send push notification
    await sendPushNotificationCalled(0);
  });

  it("notifyComment: should insert and notify - comment on another user post - notification disabled", async () => {
    // Josh turned off notification
    await updateNotificationConfig(SNAPPER_GROUP_ID, USER_Josh_ID, {
      commentNotificationEnabled: false,
    });

    await notifService.notifyComment(SINGLE_COMMENT);

    // notification disabled
    const result = await transaction.getCommentMetadata(SINGLE_COMMENT);
    expect(result).toEqual({
      username: "nubs",
      groupName: "snapper",
      userId: USER_Josh_ID,
      groupId: SNAPPER_GROUP_ID,
      isEnabled: false,
      deviceTokens: [JOSH_DEVICE_TOKEN],
    });

    // insert new notification into the table
    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, SINGLE_COMMENT.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);
    expect(results[0]?.actorId).toBe(SINGLE_COMMENT.userId);

    // but not push notification is sent
    await sendPushNotificationCalled(0);
  });

  // helpers to improve test readability
  const updateNotificationConfig = async (
    groupId: string,
    userId: string,
    payload?: NotificationConfig,
  ) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${groupId}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(userId)}`,
        },
        requestBody: payload,
      })
    ).assertStatusCode(Status.OK);
  };

  const assertNotificationLength = async (actorId: string, count: number) => {
    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, actorId));

    expect(results.length).toBe(count);
  };

  const sendPushNotificationCalled = async (time: number, argument?: unknown) => {
    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(time);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(time);

    if (argument) {
      expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledWith(argument);
    }
  };
});
