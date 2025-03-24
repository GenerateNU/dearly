import { nanoid } from "nanoid";
import { InternalServerError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { InvitationTransaction } from "./transaction";
import { GroupInvitation } from "../../types/api/internal/invite";
import { AddMemberPayload } from "../../types/api/internal/members";

/**
 * Interface defining operations related to group invitations, including the creation and verification of invitation tokens.
 * These methods allow for generating invite tokens for group access and verifying invite tokens to add users to groups.
 */
export interface InvitationService {
  /**
   * Creates a new invitation token for a group that allows a user to join the group.
   * The token will expire after 7 days from creation.
   *
   * @param groupId - The ID of the group for which the invitation is created.
   * @param userId - The ID of the user creating the invitation.
   * @returns A promise that resolves with the generated invitation token object.
   * @throws InternalServerError if the invitation token creation fails.
   */
  createInviteToken(groupId: string, userId: string): Promise<GroupInvitation>;

  /**
   * Verifies an invitation token and adds the user to the group if the token is valid.
   * The user is added to the group with the "MEMBER" role.
   *
   * @param token - The invitation token to be verified.
   * @param userId - The ID of the user attempting to join the group using the token.
   * @returns A promise that resolves when the user is successfully added to the group.
   * @throws ForbiddenError if the token is invalid or expired.
   * @throws NotFoundError if the token does not correspond to a valid group.
   */
  verifyInviteToken(token: string, userId: string): Promise<void>;
}

export class InvitationServiceImpl implements InvitationService {
  private invitationTransaction: InvitationTransaction;

  constructor(InvitationTransaction: InvitationTransaction) {
    this.invitationTransaction = InvitationTransaction;
  }

  async verifyInviteToken(token: string, userId: string): Promise<void> {
    const verifyInviteTokenImpl = async () => {
      const groupId = await this.invitationTransaction.getGroupIdFromToken(token, userId);
      const payload: AddMemberPayload = {
        groupId: groupId,
        userId: userId,
        joinedAt: new Date(),
        role: "MEMBER",
      };
      await this.invitationTransaction.insertUserByInvitation(payload);
    };
    return handleServiceError(verifyInviteTokenImpl)();
  }

  async createInviteToken(groupId: string, userId: string): Promise<GroupInvitation> {
    const createInviteTokenImpl = async () => {
      const token = nanoid();
      const sevenDaysFromToday = new Date();
      sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);
      const uploadedEncoding = await this.invitationTransaction.insertInvitation(
        {
          groupId: groupId,
          token: token,
          expiresAt: sevenDaysFromToday,
          createdAt: new Date(),
        },
        userId,
      );
      if (!uploadedEncoding) {
        throw new InternalServerError("Failed to create invitation token");
      }
      return uploadedEncoding;
    };
    return handleServiceError(createInviteTokenImpl)();
  }
}
