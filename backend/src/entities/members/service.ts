import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { Pagination, SearchedUser, User } from "../users/validator";
import { MemberTransaction } from "./transaction";
import { addMemberPayload, Member } from "./validator";

export interface MemberService {
  addMember(payload: addMemberPayload): Promise<Member>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]>;
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;

  constructor(memberTransaction: MemberTransaction) {
    this.memberTransaction = memberTransaction;
  }

  async addMember(payload: addMemberPayload): Promise<Member> {
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
}
