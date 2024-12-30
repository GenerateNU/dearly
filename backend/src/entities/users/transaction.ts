import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreateUserPayload, UpdateUserPayload, User } from "./model";
import { usersTable } from "../schema";
import { eq } from "drizzle-orm";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(id: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
}

export class UserTransactionImpl implements UserTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertUser(payload: CreateUserPayload): Promise<User | null> {
    const result = await this.db.insert(usersTable).values(payload).returning();
    return result[0] ?? null;
  }

  async selectUser(id: string): Promise<User | null> {
    const result = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return result[0] ?? null;
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User | null> {
    const result = await this.db
      .update(usersTable)
      .set({
        firstName: payload.firstName,
        lastName: payload.lastName,
      })
      .where(eq(usersTable.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteUser(id: string): Promise<User | null> {
    const result = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    return result[0] ?? null;
  }
}
