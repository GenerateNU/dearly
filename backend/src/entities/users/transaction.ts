import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  commentsTable,
  devicesTable,
  groupsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { and, eq, sql, not, exists } from "drizzle-orm";
import { PostWithMedia } from "../../types/api/internal/posts";
import {
  CreateUserPayload,
  Pagination,
  SearchedInfo,
  SearchedUser,
  UpdateUserPayload,
  User,
} from "../../types/api/internal/users";
import { Group } from "../../types/api/internal/groups";
import { Media } from "../../types/api/internal/media";

export interface UserTransaction {
  insertUser(payload: CreateUserPayload): Promise<User | null>;
  selectUser(id: string): Promise<User | null>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
  insertDeviceToken(id: string, expoToken: string): Promise<string[]>;
  deleteDeviceToken(id: string, expoToken: string): Promise<string[]>;
  getPosts(payload: Pagination): Promise<PostWithMedia[]>;
  getGroups(payload: Pagination): Promise<Group[]>;
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
        location: postsTable.location,
        profilePhoto: usersTable.profilePhoto,
        comments: sql<number>`COUNT(DISTINCT ${commentsTable.id})`.mapWith(Number),
        likes: sql<number>`COUNT(DISTINCT ${likesTable.id})`.mapWith(Number),
        isLiked: sql<boolean>`BOOL_OR(CASE WHEN ${likesTable.userId} = ${id} THEN true ELSE false END)`,
        media: sql<Media[]>`ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', ${mediaTable.id},
            'type', ${mediaTable.type},
            'postId', ${mediaTable.postId},
            'objectKey', ${mediaTable.objectKey}
          ) ORDER BY ${mediaTable.order} ASC
        )`,
      })
      .from(postsTable)
      .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      .where(eq(postsTable.userId, id))
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
        postsTable.location,
        usersTable.profilePhoto,
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

  async getUsersByUsername({
    userId,
    groupId,
    limit,
    page,
    username,
  }: SearchedInfo): Promise<SearchedUser[]> {
    const joinedResult = await this.db.transaction(async (tx) => {
      const result = await tx
        .select({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          profilePhoto: usersTable.profilePhoto,
          // return true if the user is member of group
          isMember:
            sql<boolean>`CASE WHEN ${membersTable.groupId} = ${groupId} THEN true ELSE false END`.as(
              "isMember",
            ),
        })
        .from(usersTable)
        .leftJoin(membersTable, eq(membersTable.userId, usersTable.id))
        .where(
          and(
            // exclude the user who is searching
            not(eq(usersTable.id, userId)),
            // true if user is manager of the group
            exists(
              tx
                .select()
                .from(membersTable)
                .where(
                  and(
                    eq(membersTable.role, "MANAGER"),
                    eq(membersTable.userId, userId),
                    eq(membersTable.groupId, groupId),
                  ),
                ),
            ),
          ),
        )
        // sort by most relevance
        .orderBy(
          sql`ts_rank(to_tsvector('english', ${usersTable.username}), plainto_tsquery('english', ${username})) DESC`,
        )
        // handle pagination
        .limit(limit)
        .offset((page - 1) * limit);

      return result;
    });
    return joinedResult;
  }
}
