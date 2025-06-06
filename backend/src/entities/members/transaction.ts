import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  membersTable,
  groupsTable,
  usersTable,
  postsTable,
  likesTable,
  commentsTable,
  mediaTable,
  notificationsTable,
} from "../schema";
import { eq, and, desc, or, sql, inArray } from "drizzle-orm";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { AddMemberPayload, Member } from "../../types/api/internal/members";
import { Pagination, SearchedUser } from "../../types/api/internal/users";
import { PostWithMedia } from "../../types/api/internal/posts";
import { getPostMetadata } from "../../utilities/api/query";
import { Transaction } from "../../types/api/internal/transaction";
import { NotificationConfigPayload } from "../../types/api/internal/notification";
import { IDPayload } from "../../types/api/internal/id";

/**
 * Interface defining the operations available for managing members in the application.
 * It includes methods for inserting a new member, retrieving a member by ID, deleting a member,
 * retrieving members of a group, toggling notification settings, and retrieving posts of a member.
 */
export interface MemberTransaction {
  /**
   * Inserts a new member into a group.
   * @param payload - Object containing userId, groupId, and role for the new member
   * @returns Promise resolving to the created Member object or null if insertion fails
   */
  insertMember(payload: AddMemberPayload): Promise<Member | null>;

  /**
   * Retrieves a specific member from a group.
   * @param payload - Object containing group ID and user ID to look up
   * @returns Promise resolving to the Member object or null if not found
   */
  getMember(payload: IDPayload): Promise<Member | null>;

  /**
   * Removes a member from a group. Can be performed by the member themselves or a group manager.
   * @param clientId - ID of the user making the deletion request
   * @param userId - ID of the member to be deleted
   * @param groupId - ID of the group the member is being removed from
   * @returns Promise resolving to the deleted Member object or null if not found
   */
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;

  /**
   * Retrieves a list of members belonging to a group.
   * @param groupId - ID of the group to get members from
   * @param payload - Pagination parameters for the query
   * @returns Promise resolving to an array of SearchedUser objects or null if none found
   */
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[] | null>;

  /**
   * Updates a member's notification preferences for a group.
   * @param payload - Object containing notification configuration settings
   * @returns Promise resolving to the updated Member object
   */
  toggleNotification(payload: NotificationConfigPayload): Promise<Member>;

  /**
   * Retrieves posts made by members of a group.
   * @param payload - Pagination parameters for the query
   * @param viewer - ID of the user viewing the posts
   * @param groupId - ID of the group to get posts from
   * @returns Promise resolving to an array of PostWithMedia objects
   */
  getMemberPosts(payload: Pagination, viewer: string, groupId: string): Promise<PostWithMedia[]>;
}

export class MemberTransactionImpl implements MemberTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertMember(payload: AddMemberPayload): Promise<Member | null> {
    await this.db.insert(membersTable).values(payload).onConflictDoNothing();

    const [memberAdded] = await this.db
      .select()
      .from(membersTable)
      .where(
        and(eq(membersTable.userId, payload.userId), eq(membersTable.groupId, payload.groupId)),
      )
      .limit(1);

    return memberAdded ?? null;
  }

  async getMember({ id: groupId, userId }: IDPayload): Promise<Member | null> {
    const [member] = await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)));

    return member ?? null;
  }

  async deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null> {
    // check current user is the userId/member being removed or is the manager of the group
    const [group] = await this.db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) {
      throw new NotFoundError("Group");
    }

    if (group.managerId != clientId && clientId != userId) {
      throw new ForbiddenError("You do not have the rights to remove this member.");
    }

    const memberRemoved = await this.db.transaction(async (tx) => {
      const [memberRemoved] = await tx
        .delete(membersTable)
        .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)))
        .returning();

      // delete post, comment, like and notification associated with user
      await this.deleteMemberData(groupId, userId, tx);

      return memberRemoved;
    });

    return memberRemoved ?? null;
  }

  private async deleteMemberData(groupId: string, userId: string, tx: Transaction) {
    // delete post
    await tx
      .delete(postsTable)
      .where(and(eq(postsTable.userId, userId), eq(postsTable.groupId, groupId)))
      .returning();

    // delete comment
    await tx.delete(commentsTable).where(
      inArray(
        commentsTable.id,
        tx
          .select({ id: commentsTable.id })
          .from(commentsTable)
          .innerJoin(postsTable, eq(postsTable.id, commentsTable.postId))
          .where(and(eq(postsTable.groupId, groupId), eq(commentsTable.userId, userId))),
      ),
    );

    // delete like
    await tx.delete(likesTable).where(
      inArray(
        likesTable.id,
        tx
          .select({ id: likesTable.id })
          .from(likesTable)
          .innerJoin(postsTable, eq(postsTable.id, likesTable.postId))
          .where(and(eq(postsTable.groupId, groupId), eq(likesTable.userId, userId))),
      ),
    );

    // delete notification
    await tx
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.groupId, groupId),
          or(eq(notificationsTable.receiverId, userId), eq(notificationsTable.actorId, userId)),
        ),
      );
  }

  async getMembers(
    groupId: string,
    { id, limit, page }: Pagination,
  ): Promise<SearchedUser[] | null> {
    const requesterIdIsMember = await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, id)))
      .limit(1);

    if (requesterIdIsMember.length === 0) {
      throw new ForbiddenError("You do not have the rights to the member list of this group.");
    }

    const paginatedMembers = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        profilePhoto: usersTable.profilePhoto,
        role: membersTable.role,
        lastNudgedAt: membersTable.lastManualNudge,
      })
      .from(usersTable)
      .innerJoin(membersTable, eq(usersTable.id, membersTable.userId))
      .where(eq(membersTable.groupId, groupId))
      .orderBy(sql`CASE WHEN ${membersTable.role} = 'MANAGER' THEN 0 ELSE 1 END`, usersTable.name)
      .limit(limit)
      .offset((page - 1) * limit);

    return paginatedMembers;
  }

  async toggleNotification({
    id,
    userId,
    likeNotificationEnabled,
    commentNotificationEnabled,
    postNotificationEnabled,
    nudgeNotificationEnabled,
  }: NotificationConfigPayload): Promise<Member> {
    return await this.db.transaction(async (tx) => {
      await this.validateGroup(id, userId, tx);

      const [member] = await tx
        .update(membersTable)
        .set({
          likeNotificationEnabled,
          commentNotificationEnabled,
          postNotificationEnabled,
          nudgeNotificationEnabled,
        })
        .where(and(eq(membersTable.groupId, id), eq(membersTable.userId, userId)))
        .returning();

      if (!member) {
        throw new InternalServerError("Failed to update user notification");
      }

      return member;
    });
  }

  private async validateGroup(groupId: string, userId: string, tx: Transaction): Promise<Member> {
    // check if the group exists
    const groupExists = await tx
      .select({ id: groupsTable.id })
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!groupExists.length) {
      throw new NotFoundError("Group");
    }

    // check if the user is a member and get their notification setting
    const [member] = await tx
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)))
      .limit(1);

    if (!member) {
      throw new ForbiddenError();
    }

    return member;
  }

  async getMemberPosts(
    { id: viewee, limit, page }: Pagination,
    viewer: string,
    groupId: string,
  ): Promise<PostWithMedia[]> {
    return await this.db.transaction(async (tx) => {
      // validate whether group exists or viewer belongs to the group
      await this.validateGroup(groupId, viewer, tx);

      // check if user exists or not
      const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, viewee));
      if (!user) {
        throw new NotFoundError("User");
      }

      return await tx
        .select(getPostMetadata(viewee))
        .from(postsTable)
        .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
        .innerJoin(mediaTable, eq(mediaTable.postId, postsTable.id))
        .where(and(eq(postsTable.userId, viewee), eq(postsTable.groupId, groupId)))
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
    });
  }
}
