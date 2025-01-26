import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  groupsTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../../entities/schema";
import { CreateUserPayload } from "../../entities/users/validator";
import {
  ANOTHER_GROUP,
  ANOTHER_GROUP_ID,
  DEARLY_GROUP,
  DEARLY_GROUP_ID,
  MEDIA_MOCK,
  POST_MOCK,
  USER_ALICE,
  USER_ALICE_ID,
  USER_ANA,
  USER_ANA_ID,
  USER_BILL,
  USER_BOB,
  USER_BOB_ID,
} from "./test-constants";
import { CreateGroupPayload } from "../../entities/groups/validator";

export const seedDatabase = async (db: PostgresJsDatabase) => {
  try {
    await seedUser(db);
    await seedGroup(db);
    await seedMember(db);
    await seedPostAndMedia(db);
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
