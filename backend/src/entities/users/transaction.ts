import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreateUserPayload, SearchedInfo, SearchedUser, UpdateUserPayload, User } from "./validator";
import { devicesTable, membersTable, usersTable } from "../schema";
import { and, eq, sql, not } from "drizzle-orm";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(id: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
  insertDeviceToken(id: string, expoToken: string): Promise<string[]>;
  deleteDeviceToken(id: string, expoToken: string): Promise<string[]>;
  getUsersByUsername(payload: SearchedInfo): Promise<SearchedUser[]>;
}

export class UserTransactionImpl implements UserTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertUser(payload: CreateUserPayload): Promise<User | null> {
    const [result] = await this.db.insert(usersTable).values(payload).returning();
    return result ?? null;
  }

  async selectUser(id: string): Promise<User | null> {
    const [result] = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return result ?? null;
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User | null> {
    const [result] = await this.db
      .update(usersTable)
      .set({
        name: payload.name,
        username: payload.username,
        mode: payload.mode,
        profilePhoto: payload.profilePhoto,
        notificationsEnabled: payload.notificationsEnabled,
      })
      .where(eq(usersTable.id, id))
      .returning();
    return result ?? null;
  }

  async deleteUser(id: string): Promise<User | null> {
    const [result] = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    return result ?? null;
  }

  async getUserTokens(userId: string): Promise<string[]> {
    const devices = await this.db
      .select({ token: devicesTable.token })
      .from(devicesTable)
      .where(eq(devicesTable.userId, userId));

    return devices.map((d) => d.token);
  }

  async insertDeviceToken(userId: string, token: string): Promise<string[]> {
    await this.db.insert(devicesTable).values({ userId, token }).onConflictDoNothing();
    return this.getUserTokens(userId);
  }

  async deleteDeviceToken(userId: string, token: string): Promise<string[]> {
    await this.db
      .delete(devicesTable)
      .where(and(eq(devicesTable.userId, userId), eq(devicesTable.token, token)));

    return this.getUserTokens(userId);
  }

  async getUsersByUsername({ userId, groupId, limit, offset, searchTerm }: SearchedInfo): Promise<SearchedUser[]> {
    const joinedResult = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        profilePhoto: usersTable.profilePhoto,
        isMember: sql<boolean>`CASE WHEN ${membersTable.groupId} IS NOT NULL THEN true ELSE false END`.as("isMember"),
      })
      .from(usersTable)
      // left join to check for membership of user in the group
      .leftJoin(membersTable, and(eq(membersTable.groupId, groupId), eq(membersTable.userId, usersTable.id)))
      // search by username
      .where(
        and(
          sql`to_tsvector('english', ${usersTable.username}) @@ plainto_tsquery('english', ${searchTerm})`, 
          not(eq(usersTable.id, userId)) // exclude the user who is searching
        )
      )
      // sort by most relevance
      .orderBy(sql`ts_rank(to_tsvector('english', ${usersTable.username}), plainto_tsquery('english', ${searchTerm})) DESC`)
      // handle pagination
      .limit(limit)
      .offset(offset - 1);
    
    return joinedResult;
  }
}
