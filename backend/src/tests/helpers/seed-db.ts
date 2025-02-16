import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  commentsTable,
  devicesTable,
  groupsTable,
  mediaTable,
  membersTable,
  postsTable,
  scheduledNudgesTable,
  usersTable,
  notificationsTable,
  likesTable,
} from "../../entities/schema";
import {
  ANOTHER_GROUP,
  ANOTHER_GROUP_ID,
  COMMENTS,
  DEARLY_GROUP,
  DEARLY_GROUP_ID,
  GENERATE_GROUP,
  GENERATE_GROUP_ID,
  LIKE_MOCK,
  MEDIA_MOCK,
  MOCK_EXPO_TOKEN,
  MOCK_SCHEDULE,
  NOTIFICATIONS_MOCK,
  POST_MOCK,
  USER_ALICE,
  USER_ALICE_ID,
  USER_ANA,
  USER_ANA_ID,
  USER_BILL,
  USER_BILL_ID,
  USER_BOB,
  USER_BOB_ID,
} from "./test-constants";
import { CreateGroupPayload } from "../../types/api/internal/groups";
import { CreateUserPayload } from "../../types/api/internal/users";

export const seedDatabase = async (db: PostgresJsDatabase) => {
  try {
    await seedUser(db);
    await seedDeviceTokens(db);
    await seedGroup(db);
    await seedMember(db);
    await seedPostAndMedia(db);
    await seedComments(db);
    await seedLikes(db);
    await seedNotifications(db);
    await seedSchedule(db);
  } catch (error) {
    console.error("Failed to seed database", error);
  }
};

const seedUser = async (db: PostgresJsDatabase) => {
  const seedData: CreateUserPayload[] = [USER_ALICE, USER_ANA, USER_BOB, USER_BILL];
  await db.insert(usersTable).values(seedData);
};

const seedGroup = async (db: PostgresJsDatabase) => {
  const seedData: CreateGroupPayload[] = [DEARLY_GROUP, ANOTHER_GROUP, GENERATE_GROUP];

  await db.insert(groupsTable).values(seedData);
};

const seedMember = async (db: PostgresJsDatabase) => {
  const seedData: (typeof membersTable.$inferInsert)[] = [
    {
      userId: USER_ALICE_ID,
      groupId: DEARLY_GROUP_ID,
      role: "MANAGER",
    },
    {
      userId: USER_BOB_ID,
      groupId: DEARLY_GROUP_ID,
      role: "MEMBER",
    },
    {
      userId: USER_ANA_ID,
      groupId: ANOTHER_GROUP_ID,
      role: "MANAGER",
    },
    {
      userId: USER_BILL_ID,
      groupId: GENERATE_GROUP_ID,
      role: "MANAGER",
    },
    {
      userId: USER_ALICE_ID,
      groupId: ANOTHER_GROUP_ID,
      role: "MEMBER",
    },
  ];
  await db.insert(membersTable).values(seedData);
};

const seedPostAndMedia = async (db: PostgresJsDatabase) => {
  await db.insert(postsTable).values(POST_MOCK);
  await db.insert(mediaTable).values(MEDIA_MOCK);
};

const seedComments = async (db: PostgresJsDatabase) => {
  await db.insert(commentsTable).values(COMMENTS);
};

const seedDeviceTokens = async (db: PostgresJsDatabase) => {
  await db.insert(devicesTable).values([
    {
      token: MOCK_EXPO_TOKEN,
      userId: USER_BOB_ID,
    },
  ]);
};

const seedNotifications = async (db: PostgresJsDatabase) => {
  await db.insert(notificationsTable).values(NOTIFICATIONS_MOCK);
};

const seedLikes = async (db: PostgresJsDatabase) => {
  await db.insert(likesTable).values(LIKE_MOCK);
};

const seedSchedule = async (db: PostgresJsDatabase) => {
  await db.insert(scheduledNudgesTable).values(MOCK_SCHEDULE).returning();
};
