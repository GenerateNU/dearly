import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
// import { membersTable } from "../schema";
// import { CreateMemberPayload, Member } from "./validator";

export interface MemberTransaction {
}

export class MemberTransactionImpl implements MemberTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

}
