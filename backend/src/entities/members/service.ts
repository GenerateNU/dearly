import { AddMemberPayload, Member } from "../../types/api/internal/members";
import { Pagination, SearchedUser } from "../../types/api/internal/users";
import { IDPayload } from "../../types/id";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MemberTransaction } from "./transaction";

export interface MemberService {
  addMember(payload: AddMemberPayload): Promise<Member>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]>;
  toggleNotification(payload: IDPayload): Promise<boolean>;
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;

  constructor(memberTransaction: MemberTransaction) {
    this.memberTransaction = memberTransaction;
  }

  async addMember(payload: AddMemberPayload): Promise<Member> {
    const addMemberImpl = async () => {
      const member = await this.memberTransaction.insertMember({ ...payload });
      if (!member) {
        throw new InternalServerError("Failed to add member");
      }
      return member;
    };
    return handleServiceError(addMemberImpl)();
  }

  async deleteMember(clientId: string, userId: string, groupId: string): Promise<void> {
    const deleteMemberImpl = async () => {
      await this.memberTransaction.deleteMember(clientId, userId, groupId);
    };
    return handleServiceError(deleteMemberImpl)();
  }

  async getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]> {
    const getMembersImpl = async () => {
      const members = await this.memberTransaction.getMembers(groupId, payload);
      if (!members) {
        throw new NotFoundError("Group");
      }
      return members;
    };

    return handleServiceError(getMembersImpl)();
  }

  async toggleNotification(payload: IDPayload): Promise<boolean> {
    const toggleNotificationImpl = async () => {
      return await this.memberTransaction.toggleNotification(payload);
    };
    return handleServiceError(toggleNotificationImpl)();
  }
}
