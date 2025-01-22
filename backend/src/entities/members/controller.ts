import { Context } from "hono";
import { MemberService } from "./service";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import {
  ADD_MEMBER,
  DEL_MEMBER,
  MEMBERS_API,

} from "../../types/api/routes/members";
import { MemberRole } from "../../constants/database";
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
    const addMemberImp = async () => {
      // get userId from decoded JWT
      const userId = parseUUID(ctx.req.param("userId"));
      const groupId = parseUUID(ctx.req.param("id"));

      const payloadWithIds = {
        userId: userId,
        groupId: groupId,
        role: MemberRole.MEMBER,
      };

      const member = await this.memberService.addMember(payloadWithIds);
      return ctx.json(member, Status.Created);
    };
    return await handleAppError(addMemberImp)(ctx);
    
  }

  async deleteMember(ctx: Context): Promise<DEL_MEMBER> {
      throw new Error("Method not implemented.");
  }

  async getMembers(ctx: Context): Promise<MEMBERS_API> {
      throw new Error("Method not implemented.");
  }
}
