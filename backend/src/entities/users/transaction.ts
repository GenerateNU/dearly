import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CreateUserPayload, Pagination, UpdateUserPayload, User } from "./validator";
import {
  devicesTable,
  groupsTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { and, eq, sql } from "drizzle-orm";
import { Media, PostWithMedia } from "../posts/validator";
import { Group } from "../groups/validator";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(id: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
  insertDeviceToken(id: string, expoToken: string): Promise<string[]>;
  deleteDeviceToken(id: string, expoToken: string): Promise<string[]>;
  getPosts(payload: Pagination): Promise<PostWithMedia[]>;
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

  async getPosts({ id, limit, page }: Pagination): Promise<PostWithMedia[]> {
    return await this.db
      .select({
        id: postsTable.id,
        userId: postsTable.userId,
        groupId: postsTable.groupId,
        createdAt: postsTable.createdAt,
        caption: postsTable.caption,
        media: sql<Media[]>`array_agg(
          json_build_object(
            'id', ${mediaTable.id},
            'type', ${mediaTable.type},
            'postId', ${mediaTable.postId},
            'url', ${mediaTable.url}
          )
        )`,
      })
      .from(postsTable)
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      .where(eq(postsTable.userId, id))
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
      )
      .orderBy(postsTable.createdAt)
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async getGroups({ id, limit, page }: Pagination): Promise<Group[]> {
    return await this.db
      .select({
        id: groupsTable.id,
        name: groupsTable.name,
        description: groupsTable.description,
        managerId: groupsTable.managerId,
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
