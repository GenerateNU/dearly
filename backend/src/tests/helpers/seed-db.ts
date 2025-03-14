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
  USER_JOSH,
  USER_NUBS,
  SNAPPER_GROUP,
  USER_Josh_ID,
  SNAPPER_GROUP_ID,
  USER_Nubs_ID,
  POST_EXAMPLE,
  NUBS_DEVICE_TOKEN,
  JOSH_DEVICE_TOKEN,
  LIKE_EXAMPLE,
  SINGLE_COMMENT,
  GROUP_FULL_SNAPPER_ID,
  USER_MAI_ID,
  USER_STONE_ID,
  FULL_SNAPPER_GROUP,
  USER_STONE,
  USER_MAI,
  FULL_SNAPPER_POST_EXAMPLE,
  MAI_DEVICE_TOKEN,
  BOB_MEDIA,
} from "./test-constants";
import { CreateGroupPayload } from "../../types/api/internal/groups";
import { CreateUserPayload } from "../../types/api/internal/users";
import { Comment } from "../../types/api/internal/comments";

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
  const seedData: CreateUserPayload[] = [
    USER_ALICE,
    USER_ANA,
    USER_BOB,
    USER_BILL,
    USER_JOSH,
    USER_NUBS,
    USER_STONE,
    USER_MAI,
  ];
  await db.insert(usersTable).values(seedData);
};

const seedGroup = async (db: PostgresJsDatabase) => {
  const seedData: CreateGroupPayload[] = [
    DEARLY_GROUP,
    ANOTHER_GROUP,
    GENERATE_GROUP,
    SNAPPER_GROUP,
    FULL_SNAPPER_GROUP,
  ];

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
    {
      userId: USER_Josh_ID,
      groupId: SNAPPER_GROUP_ID,
      role: "MANAGER",
    },
    {
      userId: USER_Nubs_ID,
      groupId: SNAPPER_GROUP_ID,
      role: "MEMBER",
    },
    {
      userId: USER_Nubs_ID,
      groupId: GROUP_FULL_SNAPPER_ID,
      role: "MEMBER",
    },
    {
      userId: USER_Josh_ID,
      groupId: GROUP_FULL_SNAPPER_ID,
      role: "MEMBER",
    },
    {
      userId: USER_MAI_ID,
      groupId: GROUP_FULL_SNAPPER_ID,
      role: "MEMBER",
    },
    {
      userId: USER_STONE_ID,
      groupId: GROUP_FULL_SNAPPER_ID,
      role: "MANAGER",
    },
  ];
  await db.insert(membersTable).values(seedData);
};

const seedPostAndMedia = async (db: PostgresJsDatabase) => {
  await db.insert(postsTable).values(POST_MOCK);
  await db.insert(postsTable).values(POST_EXAMPLE);
  await db.insert(postsTable).values(FULL_SNAPPER_POST_EXAMPLE);
  await db.insert(mediaTable).values(MEDIA_MOCK);
  await db.insert(mediaTable).values(BOB_MEDIA);
};

const seedComments = async (db: PostgresJsDatabase) => {
  const seedData: Comment[] = [...COMMENTS, SINGLE_COMMENT];
  await db.insert(commentsTable).values(seedData);
};

const seedDeviceTokens = async (db: PostgresJsDatabase) => {
  await db.insert(devicesTable).values([
    {
      token: MOCK_EXPO_TOKEN,
      userId: USER_BOB_ID,
    },
    {
      token: NUBS_DEVICE_TOKEN,
      userId: USER_Nubs_ID,
    },
    {
      token: JOSH_DEVICE_TOKEN,
      userId: USER_Josh_ID,
    },
    {
      token: MAI_DEVICE_TOKEN,
      userId: USER_MAI_ID,
    },
    {
      token: "1b1ceed3-d693-483a-89d2-46e6de8bea62",
      userId: USER_STONE_ID,
    },
  ]);
};

const seedNotifications = async (db: PostgresJsDatabase) => {
  await db.insert(notificationsTable).values(NOTIFICATIONS_MOCK);
};

const seedLikes = async (db: PostgresJsDatabase) => {
  await db.insert(likesTable).values(LIKE_MOCK);
  await db.insert(likesTable).values(LIKE_EXAMPLE);
};

const seedSchedule = async (db: PostgresJsDatabase) => {
  await db.insert(scheduledNudgesTable).values(MOCK_SCHEDULE).returning();
};
