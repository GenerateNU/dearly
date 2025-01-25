import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable, groupsTable, usersTable } from "../schema";
import { eq, and } from "drizzle-orm";
import { addMemberPayload, Member } from "./validator";
import { ForbiddenError, NotFoundError } from "../../utilities/errors/app-error";
import { User } from "../users/validator";

export interface MemberTransaction {
  insertMember(payload: addMemberPayload): Promise<Member | null>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;
  getMembers(
    clientId: string,
    groupId: string,
    limit: number,
    offset: number,
  ): Promise<User[] | null>;
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
    clientId: string,
    groupId: string,
    limit: number,
    offset: number,
  ): Promise<User[] | null> {
    // TODO: deal with invalid offset
    const members = await this.db
      .select({
        name: usersTable.name,
        id: usersTable.id,
        username: usersTable.username,
        mode: usersTable.mode,
        profilePhoto: usersTable.profilePhoto,
        notificationsEnabled: usersTable.notificationsEnabled,
      })
      .from(usersTable)
      .innerJoin(membersTable, eq(usersTable.id, membersTable.userId))
      .where(eq(membersTable.groupId, groupId))
      .limit(limit)
      .offset(offset);

    if (!members) return null;

    if (!members.reduce((acc, member) => acc || member.id == clientId, false)) {
      throw new ForbiddenError("You do not have the rights to the member list of this group.");
    }

    return members;
  }
}
