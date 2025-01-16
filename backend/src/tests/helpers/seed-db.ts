import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { usersTable } from "../../entities/schema";
import { CreateUserPayload } from "../../entities/users/validator";
import { USER_ALICE_ID, USER_ANA_ID, USER_BOB_ID } from "./test-constants";

export const seedDatabase = async (db: PostgresJsDatabase) => {
  await seedUser(db);
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
