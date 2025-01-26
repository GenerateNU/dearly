import { nanoid } from "nanoid";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { addMemberPayload, GroupInvitation } from "../groups/validator";
import { InvitationTransaction } from "./transaction";

export interface InvitationService {
  createInviteToken(groupId: string, userId: string): Promise<GroupInvitation>;
  verifyInviteToken(token: string, userId: string): Promise<void>;
}

export class InvitationServiceImpl implements InvitationService {
  private InvitationTransaction: InvitationTransaction;

  constructor(InvitationTransaction: InvitationTransaction) {
    this.InvitationTransaction = InvitationTransaction;
  }

  async verifyInviteToken(token: string, userId: string): Promise<void> {
    const verifyInviteTokenImpl = async () => {
      const groupId = await this.InvitationTransaction.getGroupIdFromToken(token);
      if (await this.InvitationTransaction.isManager(userId, groupId)) {
        throw new NotFoundError("Group");
      }
      if (!(await this.InvitationTransaction.verifyToken(token, groupId))) {
        throw new ForbiddenError("Token is invalid");
      }
      const payload: addMemberPayload = {
        groupId: groupId,
        userId: userId,
        joinedAt: new Date(),
        role: "MEMBER",
      };
      await this.InvitationTransaction.insertUserByInvitation(payload);
    };
    return handleServiceError(verifyInviteTokenImpl)();
  }

  async createInviteToken(groupId: string, userId: string): Promise<GroupInvitation> {
    const createInviteTokenImpl = async () => {
      const token = nanoid();
      const sevenDaysFromToday = new Date();
      sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);
      if (!(await this.InvitationTransaction.isManager(userId, groupId))) {
        throw new NotFoundError("Group");
      }
      const uploadedEncoding = await this.InvitationTransaction.insertInvitation(
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
