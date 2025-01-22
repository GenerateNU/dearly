import { InternalServerError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MemberTransaction } from "./transaction";
import { addMemberPayload, Member } from "./validator";

export interface MemberService {
  addMember(payload: addMemberPayload): Promise<Member>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;

  constructor(memberTransaction: MemberTransaction) {
    this.memberTransaction = memberTransaction;
  }

  async addMember(payload: addMemberPayload): Promise<Member> {
    const addMemberImpl = async () => {
      const member = await this.memberTransaction.insertMember({...payload,});
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
    }
    return handleServiceError(deleteMemberImpl)()
  }

}