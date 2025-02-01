import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable, groupsTable, usersTable } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { AddMemberPayload, Member } from "../../types/api/internal/members";
import { IDPayload } from "../../types/id";
import { Pagination, SearchedUser } from "../../types/api/internal/users";

export interface MemberTransaction {
  insertMember(payload: AddMemberPayload): Promise<Member | null>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[] | null>;
  toggleNotification(payload: IDPayload): Promise<boolean>;
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

    const [memberAdded] = await this.db
      .delete(membersTable)
      .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)))
      .returning();
    return memberAdded ?? null;
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
        isMember:
          sql<boolean>`CASE WHEN ${membersTable.groupId} = ${groupId} THEN true ELSE false END`.as(
            "isMember", // assuming that member includes manager
          ),
      })
      .from(usersTable)
      .innerJoin(membersTable, eq(usersTable.id, membersTable.userId))
      .where(eq(membersTable.groupId, groupId))
      .orderBy(usersTable.name)
      .limit(limit)
      .offset((page - 1) * limit);

    return paginatedMembers;
  }

  async toggleNotification({ id, userId }: IDPayload): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      //check if the group exists
      const groupExists = await tx
        .select({ id: groupsTable.id })
        .from(groupsTable)
        .where(eq(groupsTable.id, id))
        .limit(1);

      if (!groupExists.length) {
        throw new NotFoundError("Group");
      }

      // check if the user is a member and get their notification setting
      const [member] = await tx
        .select({ notificationEnabled: membersTable.notificationsEnabled })
        .from(membersTable)
        .where(and(eq(membersTable.groupId, id), eq(membersTable.userId, userId)))
        .limit(1);

      if (!member) {
        throw new ForbiddenError();
      }

      // toggle notification setting
      const newNotificationState = !member.notificationEnabled;

      // update the database within the transaction
      await tx
        .update(membersTable)
        .set({ notificationsEnabled: newNotificationState })
        .where(and(eq(membersTable.groupId, id), eq(membersTable.userId, userId)));

      return newNotificationState;
    });
  }
}
