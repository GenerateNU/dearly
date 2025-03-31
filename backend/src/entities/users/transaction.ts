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
import { getSharedGroups } from "../../utilities/api/query";

/**
 * Interface for handling user-related database transactions.
 * Provides methods for CRUD operations on users and their associated data.
 */
export interface UserTransaction {
  /**
   * Creates a new user in the database.
   * @param payload - User creation data including id, name, username, etc.
   * @returns Promise resolving to the created User or null if creation failed
   */
  insertUser(payload: CreateUserPayload): Promise<User | null>;

  /**
   * Retrieves a user's profile data, considering viewer permissions.
   * @param viewee - ID of the user being viewed
   * @param viewer - ID of the user viewing the profile
   * @returns Promise resolving to the User data or null if not found
   */
  selectUser(viewee: string, viewer: string): Promise<User | null>;

  /**
   * Updates an existing user's profile data.
   * @param id - ID of the user to update
   * @param payload - Updated user data
   * @returns Promise resolving to the updated User or null if update failed
   */
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;

  /**
   * Deletes a user from the database.
   * @param id - ID of the user to delete
   * @returns Promise resolving to the deleted User or null if deletion failed
   */
  deleteUser(id: string): Promise<User | null>;

  /**
   * Adds a device token for push notifications.
   * @param id - User ID to associate the token with
   * @param expoToken - Expo push notification token
   * @returns Promise resolving to array of user's device tokens
   */
  insertDeviceToken(id: string, expoToken: string): Promise<string[]>;

  /**
   * Removes a device token for push notifications.
   * @param id - User ID associated with the token
   * @param expoToken - Expo push notification token to remove
   * @returns Promise resolving to remaining array of user's device tokens
   */
  deleteDeviceToken(id: string, expoToken: string): Promise<string[]>;

  /**
   * Retrieves groups with pagination.
   * @param payload - Pagination parameters
   * @returns Promise resolving to array of Groups
   */
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
