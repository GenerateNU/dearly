import { getConfigurations } from "./../../config/config";
import { NotFoundError } from "../../utilities/errors/app-error";
import { ExpoNotificationService, INotificationService } from "../../services/notificationsService";
import { connectDB } from "../../database/connect";
import { POST_EXAMPLE, USER_Josh_ID } from "./../helpers/test-constants";
import { eq } from "drizzle-orm";
import { membersTable, notificationsTable } from "../../entities/schema";
import { resetDB } from "../../database/reset";
import { seedDatabase } from "../helpers/seed-db";
import { chunkPushNotificationsSpy, expo, sendPushNotificationsAsyncSpy } from "../helpers/test-app";

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const notifService: INotificationService = new ExpoNotificationService(config, db, expo);

  beforeEach(async () => {
    await resetDB(db);
    await seedDatabase(db);
    sendPushNotificationsAsyncSpy.mockClear();
    chunkPushNotificationsSpy.mockClear();
  });

  it("Unsubscribe: Should throw error for invalid userID", async () => {
    expect(async () => {
      await notifService.unsubscribe("123456");
    }).toThrow();
  });

  it("Unsubscribe: Should unsubscribe user from notifications", async () => {
    const [preResult] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.userId, USER_Josh_ID));
    const expected = preResult?.notificationsEnabled;
    expect(expected).toBe(true);

    notifService.unsubscribe(USER_Josh_ID);

    const [endResult] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.userId, USER_Josh_ID));
    const expectedAfter = endResult?.notificationsEnabled;
    expect(expectedAfter).not.toBe(NotFoundError);
    expect(expectedAfter).toBe(false);
  });

  it("notifyPost: Should insert and notify", async () => {
    await notifService.notifyPost(POST_EXAMPLE);

    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.actorId, POST_EXAMPLE.userId));

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await chunkPushNotificationsSpy).toHaveBeenCalledTimes(1);

    // expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledWith({
    //   id: "0465c9df-7832-4fbb-be79-5d1aaf670bcd",
    //   actorId: "61111211-4c0d-44d9-b2b1-8d897207f111",
    //   receiverId: "99111219-4c0d-44d9-b2b1-8d897207f111",
    //   createdAt: new Date("2025-02-15T21:15:09.365Z"),
    //   groupId: null,
    //   referenceType: "POST",
    //   postId: "ab674eaf-9999-47c1-8a38-811234567890",
    //   commentId: null,
    //   likeId: null,
    //   likeCommentId: null,
    //   title: "New Post",
    //   description: "Josh just posted in snapper",
    // });

    console.log(results);
  });
});
