import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable } from "../schema";
import { and, eq } from "drizzle-orm";

// TODO: probably put this somewhere else, maybe with members?
export interface CheckMemberTransaction {
  isMember(groupId: string, userId: string): Promise<boolean>;
  isManager(groupId: string, userId: string): Promise<boolean>;
}

export class CheckMemberTransactionImpl implements CheckMemberTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  private async getMembership(groupId: string, userId: string) {
    return await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)))
      .limit(1);
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const membership = await this.getMembership(groupId, userId);
    return membership.length > 0;
  }

  async isManager(groupId: string, userId: string): Promise<boolean> {
    const membership = await this.getMembership(groupId, userId);
    if (membership[0] && membership.length > 0) {
      return membership[0].role === "MANAGER";
    }
    return false;
  }
}
