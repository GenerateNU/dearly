import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, membersTable, usersTable } from "../../entities/schema";
import { CreateUserPayload } from "../../entities/users/validator";
import { DEARLY_GROUP_ID, USER_ALICE_ID, USER_ANA_ID, USER_BOB_ID } from "./test-constants";
import { CreateGroupPayload } from "../../entities/groups/validator";

export const seedDatabase = async (db: PostgresJsDatabase) => {
  await seedUser(db);
  await seedGroup(db);
  await seedMember(db);
};

const seedUser = async (db: PostgresJsDatabase) => {
  const seedData: CreateUserPayload[] = [
    {
      name: "Alice",
      username: "alice123",
      mode: "BASIC",
      id: USER_ALICE_ID,
    },
    {
      name: "Bob",
      username: "bobthebuilder",
      mode: "ADVANCED",
      id: USER_BOB_ID,
    },
    {
      name: "Ana",
      username: "ana",
      mode: "BASIC",
      id: USER_ANA_ID,
    },
  ];

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
    {
      userId: USER_ANA_ID,
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
