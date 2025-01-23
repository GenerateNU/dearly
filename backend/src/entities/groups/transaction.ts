import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, likesTable, mediaTable, membersTable, postsTable } from "../schema";
import {
  CalendarParamPayload,
  CreateGroupPayload,
  FeedParamPayload,
  Group,
  Thumbnail,
  ThumbnailResponse,
} from "./validator";
import { Media, PostWithMedia } from "../posts/validator";
import { sql, eq, and, gte, lte, desc } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";

export interface GroupTransaction {
  insertGroup(payload: CreateGroupPayload): Promise<Group | null>;
  getAllPosts(payload: FeedParamPayload): Promise<PostWithMedia[]>;
  getCalendar(payload: CalendarParamPayload): Promise<ThumbnailResponse[]>;
}

export class GroupTransactionImpl implements GroupTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertGroup(payload: CreateGroupPayload): Promise<Group | null> {
    const createdGroup = await this.db.transaction(async (tx) => {
      // insert a new group into database
      const group = await tx.insert(groupsTable).values(payload).returning();

      // insert manager into member table
      if (group && group[0]) {
        const newGroup = group[0];
        await tx.insert(membersTable).values({
          userId: newGroup.managerId,
          groupId: newGroup.id,
          role: "MANAGER",
        });
        return newGroup;
      }
      return null;
    });
    return createdGroup ?? null;
  }

  async getAllPosts({
    userId,
    limit,
    page,
    date,
    groupId,
  }: FeedParamPayload): Promise<PostWithMedia[]> {
    await this.checkMembership(groupId, userId);

    const selectedFields = {
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
    };

    return await this.db
      .select(selectedFields)
      .from(postsTable)
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      // extra check to return nothing if user is not a member of group
      .innerJoin(
        membersTable,
        and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)),
      )
      // TODO: make sure only comparing day, month and year not time
      .where(
        and(date ? eq(postsTable.createdAt, date) : undefined, eq(postsTable.groupId, groupId)),
      )
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
      )
      // most recent to less recent
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async checkMembership(groupId: string, userId: string): Promise<void> {
    const [group] = await this.db
      .select({
        memberId: membersTable.userId,
      })
      .from(groupsTable)
      .leftJoin(
        membersTable,
        and(eq(membersTable.groupId, groupsTable.id), eq(membersTable.userId, userId)),
      )
      .where(eq(groupsTable.id, groupId));

    if (!group) {
      throw new NotFoundError("Group");
    }

    const { memberId } = group;

    if (memberId === null) {
      throw new ForbiddenError();
    }
  }

  async getCalendar({
    date,
    userId,
    groupId,
    range,
  }: CalendarParamPayload): Promise<ThumbnailResponse[]> {
    await this.checkMembership(groupId, userId);

    // subquery to get all groups of posts that are grouped into date and sorted by likes
    const mostLikedPostsSubquery = this.db
      .select({
        createdAt: postsTable.createdAt,
        url: mediaTable.url,
        // assign a number for each row, partition posts into their date and sort by likes in descending order
        rowNum:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY DATE(${postsTable.createdAt}) ORDER BY COUNT(${likesTable.id}) DESC)`.as(
            "rowNum",
          ),
      })
      .from(postsTable)
      .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      .where(
        and(
          lte(postsTable.createdAt, sql`${date.toISOString()}`),
          gte(
            postsTable.createdAt,
            sql`${new Date(date.getTime() - range * 24 * 60 * 60 * 1000).toISOString()}`,
          ),
        ),
      )
      .groupBy(postsTable.createdAt, postsTable.id, mediaTable.url)
      .as("postsWithLikes");

    const result = await this.db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${mostLikedPostsSubquery}.createdAt)`.as("year"),
        month: sql<number>`EXTRACT(MONTH FROM ${mostLikedPostsSubquery}.createdAt)`.as("month"),
        data: sql<Thumbnail[]>`ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'date', ${mostLikedPostsSubquery}.createdAt,
            'url', ${mostLikedPostsSubquery}.url
          )
        )`.as("data"),
      })
      .from(mostLikedPostsSubquery)
      // get the most liked post from each day
      .where(sql`${mostLikedPostsSubquery}.rowNum = 1`)
      // group these posts by month and year
      .groupBy(
        sql`EXTRACT(YEAR FROM ${mostLikedPostsSubquery}.createdAt)`,
        sql`EXTRACT(MONTH FROM ${mostLikedPostsSubquery}.createdAt)`,
      )
      // order these groups by most recent month to less recent months
      .orderBy(
        sql`EXTRACT(YEAR FROM ${mostLikedPostsSubquery}.createdAt) DESC`,
        sql`EXTRACT(MONTH FROM ${mostLikedPostsSubquery}.createdAt) DESC`,
      )
      .execute();

    return result;
  }
}
