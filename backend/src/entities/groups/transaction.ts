import { ThumbnailResponse } from "./../../types/api/internal/groups";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  groupsTable,
  likesTable,
  mediaTable,
  membersTable,
  postsTable,
  usersTable,
} from "../schema";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { and, eq, sql, desc, between } from "drizzle-orm";
import { PostWithMedia } from "../../types/api/internal/posts";
import {
  CalendarParamPayload,
  CreateGroupPayload,
  FeedParamPayload,
  Group,
  GroupIdPayload,
  DayWithObjectKey,
  UpdateGroupPayload,
} from "../../types/api/internal/groups";
import { getPostMetadata } from "../../utilities/api/query";

export interface GroupTransaction {
  insertGroup(payload: CreateGroupPayload): Promise<Group | null>;
  deleteGroup(groupId: string, userId: string): Promise<void>;
  getGroup(payload: GroupIdPayload): Promise<Group | null>;
  updateGroup(payload: UpdateGroupPayload): Promise<Group | null>;
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
    tmz,
    groupId,
  }: FeedParamPayload): Promise<PostWithMedia[]> {
    await this.checkMembership(groupId, userId);

    return await this.db
      .select(getPostMetadata(userId))
      .from(postsTable)
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      .innerJoin(
        membersTable,
        and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)),
      )
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .where(
        and(
          date
            ? eq(
                sql`DATE(${postsTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${tmz})`,
                sql`${date.toISOString().split("T")[0]}::date`,
              )
            : undefined,
          eq(postsTable.groupId, groupId),
        ),
      )
      .groupBy(
        postsTable.id,
        postsTable.userId,
        postsTable.groupId,
        postsTable.createdAt,
        postsTable.caption,
        postsTable.location,
        usersTable.profilePhoto,
        usersTable.name,
        usersTable.username,
      )
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

  async updateGroup({
    groupId,
    userId,
    description,
    name,
  }: UpdateGroupPayload): Promise<Group | null> {
    await this.checkGroupOwnership(groupId, userId);

    // update group
    const updatedGroup = await this.db.transaction(async (tx) => {
      const [updatedGroup] = await tx
        .update(groupsTable)
        .set({ description: description, name: name })
        .where(and(eq(groupsTable.id, groupId), eq(groupsTable.managerId, userId)))
        .returning();

      if (!updatedGroup) return null;

      return {
        id: updatedGroup.id,
        managerId: updatedGroup.managerId,
        description: updatedGroup.description,
        name: updatedGroup.name,
      };
    });

    return updatedGroup;
  }

  async getGroup({ groupId, userId }: GroupIdPayload): Promise<Group | null> {
    await this.checkGroupMemberManagerOwnership(groupId, userId);
    const [result] = await this.db
      .select({
        id: groupsTable.id,
        managerId: groupsTable.managerId,
        description: groupsTable.description,
        name: groupsTable.name,
        likeNotificationEnabled: membersTable.likeNotificationEnabled,
        commentNotificationEnabled: membersTable.commentNotificationEnabled,
        postNotificationEnabled: membersTable.postNotificationEnabled,
        nudgeNotificationEnabled: membersTable.nudgeNotificationEnabled,
      })
      .from(groupsTable)
      .innerJoin(
        membersTable,
        and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)),
      )
      .groupBy(
        groupsTable.id,
        groupsTable.managerId,
        groupsTable.description,
        groupsTable.name,
        membersTable.likeNotificationEnabled,
        membersTable.commentNotificationEnabled,
        membersTable.postNotificationEnabled,
        membersTable.nudgeNotificationEnabled,
      )
      .where(eq(groupsTable.id, groupId));
    if (!result) return null;
    return result;
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    await this.checkGroupOwnership(groupId, userId);
    await this.db
      .delete(groupsTable)
      .where(and(eq(groupsTable.id, groupId), eq(groupsTable.managerId, userId)));
  }

  async checkGroupOwnership(groupId: string, userId: string): Promise<void> {
    const [group] = await this.db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
    if (group && group.managerId != userId) {
      throw new ForbiddenError();
    }
  }

  async getCalendar({
    pivot,
    userId,
    groupId,
    range,
    direction,
    tmzOffset,
    tmz,
  }: CalendarParamPayload): Promise<ThumbnailResponse[]> {
    await this.checkMembership(groupId, userId);

    const pivotDate = new Date(pivot);

    // add offset
    const dateWOffset = new Date(pivotDate.getTime() + tmzOffset * 60 * 1000);

    let startDate, endDate;

    switch (direction) {
      case "before":
        startDate = new Date(dateWOffset);
        startDate.setMonth(startDate.getMonth() - range);
        endDate = dateWOffset;
        break;

      case "after":
        startDate = dateWOffset;
        endDate = new Date(dateWOffset);
        endDate.setMonth(endDate.getMonth() + range);
        break;

      case "both":
        startDate = new Date(dateWOffset);
        startDate.setMonth(startDate.getMonth() - Math.floor(range / 2));
        endDate = new Date(dateWOffset);
        endDate.setMonth(endDate.getMonth() + Math.ceil(range / 2));
        break;
    }

    // Ensure we're not fetching future dates beyond current date if needed
    const currentDate = new Date();
    if (endDate > currentDate) {
      endDate = currentDate;
    }

    // subquery to get all groups of posts that are grouped into date and sorted by likes
    const rankedPosts = this.db
      .select({
        createdAt: sql`${postsTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${tmz}`.as(
          "createdAt",
        ),
        objectKey: mediaTable.objectKey,
        likes: sql<number>`COUNT(${likesTable.id}) AS likeCount`,
        rowNum:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY DATE(${postsTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${tmz}) ORDER BY COUNT(${likesTable.id}) DESC)`.as(
            "rowNum",
          ),
      })
      .from(postsTable)
      .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
      .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
      .where(
        and(
          between(
            postsTable.createdAt,
            sql`${startDate.toISOString()}`,
            sql`${endDate.toISOString()}`,
          ),
          eq(postsTable.groupId, groupId),
        ),
      )
      .groupBy(
        sql`DATE(${postsTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${tmz})`,
        postsTable.id,
        mediaTable.objectKey,
      )
      .as("rankedPosts");

    const orderDirection = direction === "after" ? "ASC" : "DESC";

    const result = await this.db
      .select({
        year: sql<number>`cast(EXTRACT(YEAR FROM ${rankedPosts.createdAt}) as int)`.as("year"),
        month: sql<number>`cast(EXTRACT(MONTH FROM ${rankedPosts.createdAt}) as int)`.as("month"),
        data: sql<DayWithObjectKey[]>`ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'day', EXTRACT(DAY FROM ${rankedPosts.createdAt}),
            'objectKey', ${rankedPosts.objectKey}
          )
        )`.as("data"),
      })
      .from(rankedPosts)
      // get the most liked post from each day
      .where(sql`${rankedPosts.rowNum} = 1`)
      // group these posts by month and year
      .groupBy(
        sql`EXTRACT(YEAR FROM ${rankedPosts.createdAt})`,
        sql`EXTRACT(MONTH FROM ${rankedPosts.createdAt})`,
      )
      // Order based on direction parameter
      .orderBy(
        sql`EXTRACT(YEAR FROM ${rankedPosts.createdAt}) ${sql.raw(orderDirection)}`,
        sql`EXTRACT(MONTH FROM ${rankedPosts.createdAt}) ${sql.raw(orderDirection)}`,
      );

    return result;
  }

  async checkGroupMemberManagerOwnership(groupId: string, userId: string): Promise<void> {
    const [group] = await this.db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
    const [member] = await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)));
    if ((group && group.managerId != userId) || (member && member.userId != userId)) {
      throw new ForbiddenError();
    }
  }
}
