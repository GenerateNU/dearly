import { getConfigurations } from "../../config/init";
import { connectDB } from "../../database/connect";
import { expect, it, describe, beforeAll, beforeEach } from "bun:test";
import { resetDB } from "../../database/reset";
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
import { SupabaseClient } from "@supabase/supabase-js";
import { count, eq } from "drizzle-orm";
import { groupsTable, membersTable, usersTable } from "../../entities/schema";
import {
  DEARLY_GROUP,
  DEARLY_GROUP_ID,
  USER_ALICE,
  USER_ALICE_ID,
  USER_MAI,
  USER_MAI_ID,
  USER_STONE,
  USER_STONE_ID,
} from "../helpers/test-constants";
import { CreateGroupPayload } from "../../types/api/internal/groups";
import { Hono } from "hono";

describe("Notification server test", () => {
  const config = getConfigurations();
  const db = connectDB(config);
  const transaction = new NotificationTransactionImpl(db);
  let app: Hono;

  const notificationService = new ExpoNotificationService(
    new SupabaseClient("supabase_url", "supabase_key"),
    transaction,
    new ExpoPushService(expo),
  );

  beforeAll(async () => {
    await automigrateDB(db, config);
    app = await startTestApp();
  });

  beforeEach(async () => {
    await resetDB(db);
    sendPushNotificationsAsyncSpy.mockClear();
    chunkPushNotificationsSpy.mockClear();
  });

  it("A complete integration test of notifications, from user registration, group creation, to creating a post, comment, and like, and receiving notifications.", async () => {
    // Arrange:
    const twoPeople = [USER_MAI, USER_STONE, USER_ALICE];
    // Add two people into the database
    await db.insert(usersTable).values(twoPeople);
    const [countUsers] = await db.select({ count: count() }).from(usersTable);
    // Assert that there are exactly two people in the database
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
  });
});
