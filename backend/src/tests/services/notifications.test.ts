import { getConfigurations } from "./../../config/config";
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
import { notificationsTable, postsTable } from "../../entities/schema";
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

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const notifService = new ExpoNotificationService(
    config,
    new NotificationTransactionImpl(db),
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

  it("notifyPost: should insert and notify for a larger group", async () => {
    await notifService.notifyPost(FULL_SNAPPER_POST_EXAMPLE);

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

  it("notifyPost: should insert and notify for a larger group with notification disabled", async () => {
    // Mai turned off notification for group
    await turnOffNotification(GROUP_FULL_SNAPPER_ID, USER_MAI_ID);

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

  it("notifyLike: Should insert and notify - like their own post", async () => {
    try {
      await notifService.notifyLike(JOSH_LIKE_POST);
    } catch {
      /* empty */
    }

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

  it("notifyComment: Should insert and notify - comment on their own post", async () => {
    try {
      await notifService.notifyComment(JOSH_COMMENT_POST);
    } catch {
      /* empty */
    }

    await assertNotificationLength(JOSH_COMMENT_POST.userId, 0);
    await sendPushNotificationCalled(0);
  });

  it("notifyLike: should insert and notify - like another user post - notification disabled", async () => {
    // Josh turned off notification
    await turnOffNotification(SNAPPER_GROUP_ID, USER_Josh_ID);

    try {
      await notifService.notifyLike(LIKE_EXAMPLE);
    } catch {
      /* empty */
    }

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, LIKE_EXAMPLE.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.actorId).toBe(LIKE_EXAMPLE.userId);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);

    await sendPushNotificationCalled(0);
  });

  it("notifyComment: should insert and notify - comment on another user post - notification disabled", async () => {
    // Josh turned off notification
    await turnOffNotification(SNAPPER_GROUP_ID, USER_Josh_ID);

    try {
      await notifService.notifyComment(SINGLE_COMMENT);
    } catch {
      /* empty */
    }

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, SINGLE_COMMENT.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);
    expect(results[0]?.actorId).toBe(SINGLE_COMMENT.userId);

    await sendPushNotificationCalled(0);
  });

  // helpers to improve test readability
  const turnOffNotification = async (groupId: string, userId: string) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${groupId}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(userId)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully turn off notification for group");
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
