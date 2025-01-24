import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, membersTable } from "../schema";
import { CreateGroupPayload, Group, GroupIdPayload, UpdateGroupPayload } from "./validator";
import { ForbiddenError } from "../../utilities/errors/app-error";
import { and, eq } from "drizzle-orm";

export interface GroupTransaction {
  insertGroup(payload: CreateGroupPayload): Promise<Group | null>;
  deleteGroup(groupId: string, userId: string): Promise<void>;
  getGroup(payload: GroupIdPayload): Promise<Group | null>;
  updateGroup(payload: UpdateGroupPayload): Promise<Group | null>;
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

  async updateGroup({
    groupId,
    userId,
    description,
    name,
  }: UpdateGroupPayload): Promise<Group | null> {
    await this.checkGroupOwnership(groupId, userId);

    // update group
    const updatedGroup = await this.db.transaction(async (tx) => {
      const [updatedGroup] = await tx
        .update(groupsTable)
        .set({ description: description, name: name })
        .where(and(eq(groupsTable.id, groupId), eq(groupsTable.managerId, userId)))
        .returning();

      if (!updatedGroup) return null;

      return {
        id: updatedGroup.id,
        managerId: updatedGroup.managerId,
        description: updatedGroup.description,
        name: updatedGroup.name,
      };
    });

    return updatedGroup;
  }

  async getGroup({ groupId, userId }: GroupIdPayload): Promise<Group | null> {
    await this.checkGroupMemberManagerOwnership(groupId, userId);
    const [result] = await this.db
      .select({
        id: groupsTable.id,
        managerId: groupsTable.managerId,
        description: groupsTable.description,
        name: groupsTable.name,
      })
      .from(groupsTable)
      .groupBy(groupsTable.id, groupsTable.managerId, groupsTable.description, groupsTable.name)
      .where(eq(groupsTable.id, groupId));
    if (!result) return null;
    return result;
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

  async checkGroupMemberManagerOwnership(groupId: string, userId: string): Promise<void> {
    const [group] = await this.db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
    const [member] = await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)));
    if ((group && group.managerId != userId) || (member && member.userId != userId)) {
      throw new ForbiddenError();
    }
  }
}
