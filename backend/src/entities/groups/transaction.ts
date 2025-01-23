import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, membersTable, usersTable } from "../schema";
import { CreateGroupPayload, Group, IDPayload, UpdateGroupPayload } from "./validator";
import { ForbiddenError } from "../../utilities/errors/app-error";
import { and, eq, or } from "drizzle-orm";
import { PostWithMedia, UpdatePostPayload } from "../posts/validator";

export interface GroupTransaction {
  insertGroup(payload: CreateGroupPayload): Promise<Group | null>;
  deleteGroup(groupId: string, userId: string): Promise<void>;
  getGroup(payload: IDPayload): Promise<Group | null>;
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

  async updateGroup({ id, userId, description, name }: UpdateGroupPayload): Promise<Group | null> {
    await this.checkGroupOwnership(id, userId);

    // update group
    const updatedGroup = await this.db.transaction(async (tx) => {
      const [updatedGroup] = await tx
        .update(groupsTable)
        .set({ description: description, name: name })
        .where(and(eq(groupsTable.id, id), eq(groupsTable.managerId, userId)))
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

  async getGroup({ id, userId }: IDPayload): Promise<Group | null> {
    const [result] = await this.db
      .select({
        id: groupsTable.id,
        managerId: groupsTable.managerId,
        description: groupsTable.description,
        name: groupsTable.name,
      })
      .from(groupsTable)
      .innerJoin(usersTable, eq(usersTable.id, groupsTable.managerId))
      .innerJoin(
        membersTable,
        and(eq(groupsTable.id, membersTable.groupId), eq(membersTable.userId, userId)),
      )
      .groupBy(groupsTable.id, groupsTable.managerId, groupsTable.description, groupsTable.name)
      .where(
        and(
          eq(groupsTable.id, id),
          or(
            // check group
            eq(groupsTable.managerId, userId),
          ), // check if user is manager
          eq(membersTable.userId, userId),
        ),
      ); // check if user is member

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
}
