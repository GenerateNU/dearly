import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  commentsTable,
  devicesTable,
  groupsTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../../entities/schema";
import {
  ANOTHER_GROUP,
  ANOTHER_GROUP_ID,
  COMMENTS,
  DEARLY_GROUP,
  DEARLY_GROUP_ID,
  MEDIA_MOCK,
  MOCK_EXPO_TOKEN,
  POST_MOCK,
  USER_ALICE,
  USER_ALICE_ID,
  USER_ANA,
  USER_ANA_ID,
  USER_BILL,
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
  } catch (error) {
    console.error("Failed to seed database", error);
  }
};

const seedUser = async (db: PostgresJsDatabase) => {
  const seedData: CreateUserPayload[] = [USER_ALICE, USER_ANA, USER_BOB, USER_BILL];
  await db.insert(usersTable).values(seedData);
};

const seedGroup = async (db: PostgresJsDatabase) => {
  const seedData: CreateGroupPayload[] = [DEARLY_GROUP, ANOTHER_GROUP];

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
