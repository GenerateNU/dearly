import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { linksTable, membersTable, invitationsTable } from "../schema";
import { AddMemberPayload } from "../../types/api/internal/members";
import {
  CreateInvitePayload,
  CreateLinkPayload,
  GroupInvitation,
} from "../../types/api/internal/invite";

export interface InvitationTransaction {
  /**
   * @param userId the id of the user getting invited
   * @param groupId the id of the group the user is getting invited to
   */
  isManager(userId: string, groupId: string): Promise<boolean>;
  verifyToken(token: string, groupId: string): Promise<boolean>;
  insertUserByInvitation(payload: AddMemberPayload): Promise<void>;
  insertInvitation(payload: CreateLinkPayload, userId: string): Promise<GroupInvitation | null>;
  getGroupIdFromToken(token: string): Promise<string>;
}
export class InvitationTransactionImpl implements InvitationTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getGroupIdFromToken(token: string): Promise<string> {
    return await this.db.transaction(async (tx) => {
      const [result] = await tx
        .select({ groupId: linksTable.groupId })
        .from(linksTable)
        .where(eq(linksTable.token, token));

      if (!result) {
        throw new NotFoundError("Invalid Token");
      }
      return result.groupId;
    });
  }

  async verifyToken(token: string, groupId: string): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const match = and(eq(linksTable.token, token), eq(linksTable.groupId, groupId));
      const [query] = await tx.select().from(linksTable).where(match);
      if (!query || query.expiresAt < new Date()) {
        return false;
      }
      return true;
    });
  }

  async insertUserByInvitation(payload: AddMemberPayload): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [insert] = await tx.insert(membersTable).values(payload).returning();
      if (!insert) {
        throw new InternalServerError("Error adding user to the group");
      }
    });
  }

  async isManager(userId: string, groupId: string): Promise<boolean> {
    const managerTx = await this.db.transaction(async (tx) => {
      const [manager] = await tx
        .select()
        .from(membersTable)
        .where(and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)));
      if (!manager) {
        return false;
      } else {
        return manager.role === "MANAGER";
      }
    });
    return managerTx;
  }

  async insertInvitation(
    payload: CreateLinkPayload,
    userId: string,
  ): Promise<GroupInvitation | null> {
    const createdInvitation = await this.db.transaction(async (tx) => {
      const [link] = await tx.insert(linksTable).values(payload).returning();
      if (!link) {
        return null;
      }
      const newInviteEntry: CreateInvitePayload = {
        groupId: link.groupId,
        recipientId: userId,
        invitationLinkId: link.id,
      };
      const [invite] = await tx.insert(invitationsTable).values(newInviteEntry).returning();
      if (!invite) {
        return null;
      }
      return { token: link.token };
    });
    return createdInvitation;
  }
}
