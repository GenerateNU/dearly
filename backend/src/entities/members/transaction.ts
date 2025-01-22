import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable, groupsTable } from "../schema";
import { eq, and } from "drizzle-orm";
import { addMemberPayload, Member } from "./validator";
import { ForbiddenError } from "../../utilities/errors/app-error";

export interface MemberTransaction {
  insertMember(payload: addMemberPayload): Promise<Member | null>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null>;
}

export class MemberTransactionImpl implements MemberTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async insertMember(payload: addMemberPayload): Promise<Member | null> {
    const [memberAdded] = await this.db.insert(membersTable).values(payload).returning();
      return memberAdded ?? null;
  }

  async deleteMember(clientId: string, userId: string, groupId: string): Promise<Member | null> {

    // check current user is the userId/member being removed or is the manager of the group
    // Select the group
    const [group] = await this.db.select().from(groupsTable).where(eq(groupsTable.id, groupId)).limit(1)

    if (group && (group.managerId != clientId) || clientId != userId) {
      throw new ForbiddenError("You do not have the rights to remove this member.") 
    }

    const [memberAdded] = await this.db.delete(membersTable).where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId))).returning();
      return memberAdded ?? null;
  }
}
