import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { devicesTable, groupsTable, membersTable, postsTable, usersTable } from "../schema";
import { and, eq, sql, inArray } from "drizzle-orm";
import {
  CreateUserPayload,
  Pagination,
  UpdateUserPayload,
  User,
} from "../../types/api/internal/users";
import { Group } from "../../types/api/internal/groups";
import { getSharedGroups } from "../../utilities/query";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(viewee: string, viewer: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
  insertDeviceToken(id: string, expoToken: string): Promise<string[]>;
  deleteDeviceToken(id: string, expoToken: string): Promise<string[]>;
  getGroups(payload: Pagination): Promise<Group[]>;
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

  async selectUser(viewee: string, viewer: string): Promise<User | null> {
    const userQuery = {
      name: usersTable.name,
      id: usersTable.id,
      username: usersTable.username,
      mode: usersTable.mode,
      profilePhoto: usersTable.profilePhoto,
      timezone: usersTable.timezone,
      bio: usersTable.bio,
      birthday: usersTable.birthday,
      postCount: sql<number>`COUNT(DISTINCT ${postsTable.id})`.mapWith(Number),
    };

    const [result] = await this.db
      .select(userQuery)
      .from(usersTable)
      .leftJoin(
        postsTable,
        viewer === viewee
          ? eq(postsTable.userId, usersTable.id)
          : and(
              eq(postsTable.userId, usersTable.id),
              inArray(postsTable.groupId, getSharedGroups(this.db, viewee, viewer)),
            ),
      )
      .where(eq(usersTable.id, viewee))
      .groupBy(
        usersTable.name,
        usersTable.id,
        usersTable.username,
        usersTable.mode,
        usersTable.profilePhoto,
        usersTable.timezone,
        usersTable.bio,
        usersTable.birthday,
      )
      .limit(1);

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
        bio: payload.bio,
        birthday: payload.birthday,
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

  async getGroups({ id, limit, page }: Pagination): Promise<Group[]> {
    return await this.db
      .select({
        id: groupsTable.id,
        name: groupsTable.name,
        description: groupsTable.description,
        managerId: groupsTable.managerId,
        likeNotificationEnabled: membersTable.likeNotificationEnabled,
        commentNotificationEnabled: membersTable.commentNotificationEnabled,
        postNotificationEnabled: membersTable.postNotificationEnabled,
        nudgeNotificationEnabled: membersTable.nudgeNotificationEnabled,
      })
      .from(groupsTable)
      .innerJoin(
        membersTable,
        and(eq(membersTable.groupId, groupsTable.id), eq(membersTable.userId, id)),
      )
      .orderBy(groupsTable.name)
      .limit(limit)
      .offset((page - 1) * limit);
  }
}
