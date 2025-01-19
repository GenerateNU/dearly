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
  DEARLY_GROUP_ID,
  MEDIA_MOCK,
  POST_MOCK,
  USER_ALICE,
  USER_ALICE_ID,
  USER_ANA,
  USER_BILL,
  USER_BOB,
  USER_BOB_ID,
} from "./test-constants";
import { CreateGroupPayload } from "../../entities/groups/validator";

export const seedDatabase = async (db: PostgresJsDatabase) => {
  await seedUser(db);
  await seedGroup(db);
  await seedMember(db);
  await seedPostAndMedia(db);
};

const seedUser = async (db: PostgresJsDatabase) => {
  const seedData: CreateUserPayload[] = [USER_ALICE, USER_ANA, USER_BOB, USER_BILL];

  try {
    await db.insert(usersTable).values(seedData);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

const seedGroup = async (db: PostgresJsDatabase) => {
  const seedData: CreateGroupPayload[] = [
    {
      name: "dearly",
      description: "dearly",
      managerId: USER_ALICE_ID,
      id: DEARLY_GROUP_ID,
    },
  ];

  try {
    await db.insert(groupsTable).values(seedData);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
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
  ];

  try {
    await db.insert(membersTable).values(seedData);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

const seedPostAndMedia = async (db: PostgresJsDatabase) => {
  try {
    await db.insert(postsTable).values(POST_MOCK);
    await db.insert(mediaTable).values(MEDIA_MOCK);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
