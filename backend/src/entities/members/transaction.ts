import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable, groupsTable, usersTable } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { addMemberPayload, Member } from "./validator";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { Pagination, SearchedUser, User } from "../users/validator";

export interface MemberTransaction {
  insertMember(payload: addMemberPayload): Promise<Member | null>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[] | null>;
}

export class MemberTransactionImpl implements MemberTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertMember(payload: addMemberPayload): Promise<Member | null> {
    // TODO: on conflict do nothing
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
    if (!id || !groupId) {
      throw new BadRequestError("Invalid request parameters.");
    }

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
}
