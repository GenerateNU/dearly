import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../entities/schema";
import { seed, reset } from "drizzle-seed";

export const seedWithRandomData = async (db: PostgresJsDatabase) => {
  await reset(db, schema);
  await seed(db, schema);
};
