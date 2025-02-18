import { getConfigurations } from "./../../config/config";
import { NotFoundError } from "../../utilities/errors/app-error";
import { ExpoNotificationService, INotificationService } from "../../services/notificationsService";
import { connectDB } from "../../database/connect";
import {
  ADRIENNE_COMMENTS_BUCKPOST,
  FULL_SNAPPER_POST_EXAMPLE,
  LIKE_EXAMPLE,
  POST_EXAMPLE,
  SINGLE_COMMENT,
  USER_ADRIENNE_ID,
  USER_BUCK_ID,
  USER_Nubs_ID,
} from "./../helpers/test-constants";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { spyOn, describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { notificationsTable } from "../../entities/schema";
import { resetDB } from "../../database/reset";
import { seedDatabase } from "../helpers/seed-db";
import {
  chunkPushNotificationsSpy,
  expo,
  sendPushNotificationsAsyncSpy,
} from "../helpers/test-app";

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const notifService: INotificationService = new ExpoNotificationService(config, db, expo);
  const pushNotiSpy = spyOn(expo, "sendPushNotificationsAsync");
  const chunkNotificationsSpy = spyOn(expo, "chunkPushNotifications");
  let app: Hono;

  beforeAll(async () => {
    app = await startTestApp();
  });

  beforeEach(async () => {
    // to reset number of times its method gets called
    pushNotiSpy.mockClear();
    chunkNotificationsSpy.mockClear();

    await resetDB(db);
    await seedDatabase(db);
    sendPushNotificationsAsyncSpy.mockClear();
    chunkPushNotificationsSpy.mockClear();
  });

  it("notifyPost: Should insert and notify", async () => {
    await notifService.notifyPost(POST_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, POST_EXAMPLE.userId));
    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(USER_Nubs_ID);
    expect(results[0]?.receiverId).not.toBe(POST_EXAMPLE.userId);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(1);
  });

  it("notifyPost: Should insert and notifiy for a larger group", async () => {
    await notifService.notifyPost(FULL_SNAPPER_POST_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, FULL_SNAPPER_POST_EXAMPLE.userId));
    expect(results.length).toBe(3);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(1);
  });

  it("notifyLike: Should insert and notifiy", async () => {
    await notifService.notifyLike(LIKE_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, LIKE_EXAMPLE.userId));

    expect(results.length).toBe(1);
    expect(results[0]?.actorId).toBe(LIKE_EXAMPLE.userId);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(1);
  });

  it("notifyComment: Should insert and notifiy", async () => {
    await notifService.notifyComment(SINGLE_COMMENT);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, SINGLE_COMMENT.userId));
    expect(results.length).toBe(1);
    expect(results[0]?.receiverId).toBe(POST_EXAMPLE.userId);
    expect(results[0]?.actorId).toBe(SINGLE_COMMENT.userId);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(1);
  });
});
