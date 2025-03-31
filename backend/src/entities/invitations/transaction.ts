import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { linksTable, membersTable, invitationsTable } from "../schema";
import { AddMemberPayload } from "../../types/api/internal/members";
import {
  CreateInvitePayload,
  CreateLinkPayload,
  GroupInvitation,
} from "../../types/api/internal/invite";
import { isManager } from "../../utilities/api/query";
import { Transaction } from "../../types/api/internal/transaction";

/**
 * Interface defining the operations related to group invitations and member management in the transaction layer.
 * These operations include inserting users into groups via invitations, managing group invitation links, and retrieving group IDs based on invitation tokens.
 */
export interface InvitationTransaction {
  /**
   * Inserts a user into a group as a member based on the provided invitation payload.
   *
   * @param payload - An object containing the user and group information to add the user as a member.
   * @returns A promise that resolves when the user is successfully added to the group.
   * @throws InternalServerError if there is an error adding the user to the group.
   */
  insertUserByInvitation(payload: AddMemberPayload): Promise<void>;

  /**
   * Inserts a new group invitation link for a specific user and returns the invitation token.
   *
   * @param payload - An object containing the group ID, the invitation link data, and expiration details.
   * @param userId - The ID of the user requesting the invitation creation.
   * @returns A promise that resolves with the generated group invitation, or null if the invitation creation fails.
   * @throws NotFoundError if the user is not a manager of the group.
   */
  insertInvitation(payload: CreateLinkPayload, userId: string): Promise<GroupInvitation | null>;

  /**
   * Retrieves the group ID associated with a specific invitation token for a given user.
   *
   * @param token - The invitation token to validate.
   * @param userId - The ID of the user attempting to use the invitation token.
   * @returns A promise that resolves with the group ID associated with the invitation token.
   * @throws NotFoundError if the token is invalid or if the group does not exist.
   * @throws ForbiddenError if the token is expired or invalid for the user.
   */
  getGroupIdFromToken(token: string, userId: string): Promise<string>;
}

export class InvitationTransactionImpl implements InvitationTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getGroupIdFromToken(token: string, userId: string): Promise<string> {
    return await this.db.transaction(async (tx) => {
      const [result] = await tx
        .select({ groupId: linksTable.groupId })
        .from(linksTable)
        .where(eq(linksTable.token, token));
      if (!result) {
        throw new NotFoundError("Invalid Token");
      }
      const groupId = result.groupId;

      if (await isManager(tx, userId, groupId)) {
        throw new NotFoundError("Group");
      }

      if (!(await this.verifyToken(tx, token, groupId))) {
        throw new ForbiddenError("Token is invalid");
      }
      return groupId;
    });
  }

  private async verifyToken(tx: Transaction, token: string, groupId: string): Promise<boolean> {
    const match = and(eq(linksTable.token, token), eq(linksTable.groupId, groupId));
    const [query] = await tx.select().from(linksTable).where(match);
    if (!query || query.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  async insertUserByInvitation(payload: AddMemberPayload): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [insert] = await tx.insert(membersTable).values(payload).returning();
      if (!insert) {
        throw new InternalServerError("Error adding user to the group");
      }
    });
  }

  async insertInvitation(
    payload: CreateLinkPayload,
    userId: string,
  ): Promise<GroupInvitation | null> {
    const createdInvitation = await this.db.transaction(async (tx) => {
      if (!(await isManager(tx, userId, payload.groupId))) {
        throw new NotFoundError("Group");
      }
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
