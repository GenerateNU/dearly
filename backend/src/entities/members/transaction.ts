import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { membersTable } from "../schema";
import { addMemberPayload, Member } from "./validator";

export interface MemberTransaction {
  insertMember(payload: addMemberPayload): Promise<Member | null>;
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
}
