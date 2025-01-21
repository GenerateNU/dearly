import { Context } from "hono";
import { MemberService } from "./service";
import {
} from "./validator";
// import { parseUUID } from "../../utilities/uuid";
// import { handleAppError } from "../../utilities/errors/app-error";
// import { Status } from "../../constants/http";
import {
  ADD_MEMBER,
  DEL_MEMBER,
  MEMBERS_API,

} from "../../types/api/routes/members";
// import { paginationSchema } from "../../utilities/pagination";

export interface MemberController {
  addMember(ctx: Context): Promise<ADD_MEMBER>;
  deleteMember(ctx: Context): Promise<DEL_MEMBER>;
  getMembers(ctx: Context): Promise<MEMBERS_API>;
}

export class MemberControllerImpl implements MemberController {
  private memberService: MemberService;

  constructor(service: MemberService) {
    this.memberService = service;
  }

  async addMember(ctx: Context): Promise<ADD_MEMBER> {
      throw new Error("Method not implemented.");
  }

  async deleteMember(ctx: Context): Promise<DEL_MEMBER> {
      throw new Error("Method not implemented.");
  }

  async getMembers(ctx: Context): Promise<MEMBERS_API> {
      throw new Error("Method not implemented.");
  }
}
