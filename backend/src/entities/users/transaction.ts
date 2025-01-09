import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreateUserPayload, UpdateUserPayload, User } from "./validator";
import { usersTable } from "../schema";
import { eq, sql } from "drizzle-orm";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(id: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
  insertDeviceToken(id: string, expoToken: string): Promise<User | null>;
  deleteDeviceToken(id: string, expoToken: string): Promise<User | null>;
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
        name: payload.name,
        username: payload.username,
        mode: payload.mode,
        profilePhoto: payload.profilePhoto,
        deviceTokens: payload.deviceTokens,
        notificationsEnabled: payload.notificationsEnabled,
      })
      .where(eq(usersTable.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteUser(id: string): Promise<User | null> {
    const result = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    return result[0] ?? null;
  }

  async insertDeviceToken(id: string, expoToken: string): Promise<User | null> {
    const result = await this.db.transaction(async (tx) => {
      let user = await tx.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

      if (user[0] && !user[0].deviceTokens?.includes(expoToken)) {
        user = await tx
          .update(usersTable)
          .set({
            deviceTokens: sql`array_append(${usersTable.deviceTokens}, ${expoToken})`,
          })
          .where(eq(usersTable.id, id))
          .returning();
      }
      return user;
    });

    return result[0] ?? null;
  }

  async deleteDeviceToken(id: string, expoToken: string): Promise<User | null> {
    const result = await this.db.transaction(async (tx) => {
      let user = await tx.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

      if (user[0] && user[0].deviceTokens?.includes(expoToken)) {
        user = await tx
          .update(usersTable)
          .set({
            deviceTokens: sql`array_remove(${usersTable.deviceTokens}, ${expoToken})`,
          })
          .where(eq(usersTable.id, id))
          .returning();
      }
      return user;
    });

    return result[0] ?? null;
  }
}
