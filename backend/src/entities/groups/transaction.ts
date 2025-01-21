import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, membersTable, postsTable } from "../schema";
import { CreateGroupPayload, Group } from "./validator";
import { ForbiddenError } from "../../utilities/errors/app-error";
import { and, eq } from "drizzle-orm";

export interface GroupTransaction {
  insertGroup(payload: CreateGroupPayload): Promise<Group | null>;
  deleteGroup(groupId: string, userId: string): Promise<void>;
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
}
