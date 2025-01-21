// import { InternalServerError } from "../../utilities/errors/app-error";
// import { handleServiceError } from "../../utilities/errors/service-error";
import { MemberTransaction } from "./transaction";
// import { CreateMemberPayload, Member } from "./validator";

export interface MemberService {
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;

  constructor(memberTransaction: MemberTransaction) {
    this.memberTransaction = memberTransaction;
  }

}