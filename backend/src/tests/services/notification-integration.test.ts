import { getConfigurations } from "../../config/init";
import { connectDB } from "../../database/connect";
import { expect, it, describe, beforeAll, beforeEach } from "bun:test";
import { resetDB } from "../../database/reset";
import {
  chunkPushNotificationsSpy,
  expo,
  sendPushNotificationsAsyncSpy,
} from "../helpers/test-app";
import { automigrateDB } from "../../database/migrate";
import { ExpoNotificationService } from "../../services/notification/service";
import { NotificationTransactionImpl } from "../../services/notification/transaction";
import { ExpoPushService } from "../../services/notification/expo";
import { SupabaseClient } from "@supabase/supabase-js";
import { count, eq } from "drizzle-orm";
import {
  devicesTable,
  groupsTable,
  membersTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "../../entities/schema";
import {
  DEARLY_GROUP,
  DEARLY_GROUP_ID,
  MAI_DEVICE_TOKEN,
  MOCK_EXPO_TOKEN,
  NUBS_DEVICE_TOKEN,
  POST_ID,
  USER_ALICE,
  USER_ALICE_ID,
  USER_MAI,
  USER_MAI_ID,
  USER_STONE,
  USER_STONE_ID,
} from "../helpers/test-constants";
import { CreateGroupPayload } from "../../types/api/internal/groups";
import { Post } from "../../types/api/internal/posts";

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const transaction = new NotificationTransactionImpl(db);
  const notificationService = new ExpoNotificationService(
    new SupabaseClient("supabase_url", "supabase_key"),
    transaction,
    new ExpoPushService(expo),
  );

  beforeAll(async () => {
    await automigrateDB(db, config);
  });

  beforeEach(async () => {
    await resetDB(db);
    sendPushNotificationsAsyncSpy.mockClear();
    chunkPushNotificationsSpy.mockClear();
  });

  it("A complete integration test of notifications, from user registration, group creation, to creating a post, comment, and like, and receiving notifications.", async () => {
    // Arrange:
    const threePeople = [USER_MAI, USER_STONE, USER_ALICE];
    // Add three people into the database
    await db.insert(usersTable).values(threePeople);
    const [countUsers] = await db.select({ count: count() }).from(usersTable);
    // Assert that there are exactly three people in the database
    expect(countUsers!.count).toBe(3);
    // Add a group
    const oneGroup: CreateGroupPayload[] = [DEARLY_GROUP];
    await db.insert(groupsTable).values(oneGroup);
    const [countGroups] = await db.select({ count: count() }).from(groupsTable);
    expect(countGroups!.count).toBe(1);
    // Alice is the group manager of dearly, invite user mai and user stone
    const members: (typeof membersTable.$inferInsert)[] = [
      {
        userId: USER_ALICE_ID,
        groupId: DEARLY_GROUP_ID,
        role: "MANAGER",
      },
      {
        userId: USER_STONE_ID,
        groupId: DEARLY_GROUP_ID,
        role: "MEMBER",
      },
      {
        userId: USER_MAI_ID,
        groupId: DEARLY_GROUP_ID,
        role: "MEMBER",
      },
    ];
    await db.insert(membersTable).values(members);
    const [countMembers] = await db
      .select({ count: count() })
      .from(membersTable)
      .where(eq(membersTable.groupId, DEARLY_GROUP_ID));
    expect(countMembers!.count).toBe(3);
    // CONTEXT PROVIDED, LETS TEST WHAT HAPPENS TO THE NOTIFICATIONS
    // Assert that the notification table is currently empty
    let [countNotifications] = await db.select({ count: count() }).from(notificationsTable);
    expect(countNotifications!.count).toBe(0);

    const post: Post = {
      userId: USER_ALICE_ID,
      groupId: DEARLY_GROUP_ID,
      id: POST_ID,
      createdAt: new Date(-1),
      caption: "my first post",
      location: "Your Moms house.",
    };

    await db.insert(postsTable).values(post);
    // TEST CASE 1: User Alice makes a single post
    // Assert that the post was indeed recored in the table
    const [countPostFromDearlyGroup] = await db
      .select({ count: count() })
      .from(postsTable)
      .where(eq(postsTable.groupId, DEARLY_GROUP_ID));
    expect(countPostFromDearlyGroup!.count).toBe(1);

    // Add the correct device tokens
    await db.insert(devicesTable).values([
      {
        token: MOCK_EXPO_TOKEN,
        userId: USER_ALICE_ID,
      },
      {
        token: MAI_DEVICE_TOKEN,
        userId: USER_MAI_ID,
      },
      {
        token: NUBS_DEVICE_TOKEN,
        userId: USER_STONE_ID,
      },
    ]);

    const [countDeviceTokens] = await db.select({ count: count() }).from(devicesTable);
    expect(countDeviceTokens!.count).toBe(3);
    // now we notify them of the posts
    await notificationService.notifyPost(post);
    [countNotifications] = await db.select({ count: count() }).from(notificationsTable);
    expect(countNotifications!.count).toBe(2);
    // What happens when we call again? To simulate supabase calling the callback multiple times.
    await notificationService.notifyPost(post);
    [countNotifications] = await db.select({ count: count() }).from(notificationsTable);
    expect(countNotifications!.count).toBe(2);
  });
});
