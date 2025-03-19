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
import { eq, and, desc, or } from "drizzle-orm";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { AddMemberPayload, Member, GroupMember } from "../../types/api/internal/members";
import { Pagination } from "../../types/api/internal/users";
import { PostWithMedia } from "../../types/api/internal/posts";
import { getPostMetadata } from "../../utilities/query";
import { Transaction } from "../../types/api/internal/transaction";
import { NotificationConfigPayload } from "../../types/api/internal/notification";
import { IDPayload } from "../../types/id";

export interface MemberTransaction {
  insertMember(payload: AddMemberPayload): Promise<Member | null>;
  getMember(payload: IDPayload): Promise<Member | null>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;
  toggleNotification(payload: NotificationConfigPayload): Promise<Member>;
  getMembers(groupId: string, payload: Pagination): Promise<GroupMember[] | null>;
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
    const comments = tx.$with("comments").as(
      tx
        .select()
        .from(commentsTable)
        .innerJoin(postsTable, eq(postsTable.id, commentsTable.postId))
        .where(and(eq(postsTable.groupId, groupId), eq(commentsTable.userId, userId))),
    );
    await tx.with(comments).delete(commentsTable);

    // delete like
    const likes = tx.$with("likes").as(
      tx
        .select()
        .from(likesTable)
        .innerJoin(postsTable, eq(postsTable.id, likesTable.postId))
        .where(and(eq(postsTable.groupId, groupId), eq(likesTable.userId, userId))),
    );
    await tx.with(likes).delete(likesTable);

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
  ): Promise<GroupMember[] | null> {
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
      .orderBy(usersTable.name)
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
        .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
        .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
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
