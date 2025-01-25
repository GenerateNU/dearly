import { Context } from "hono";
import { MemberService } from "./service";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import { ADD_MEMBER, DEL_MEMBER, MEMBERS_API } from "../../types/api/routes/members";
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
    const deleteMemberImpl = async () => {
      // get userId from decoded JWT
      const clientId = parseUUID(ctx.get("userId"));
      const userId = parseUUID(ctx.req.param("userId"));
      const groupId = parseUUID(ctx.req.param("id"));

      await this.memberService.deleteMember(clientId, userId, groupId);
      return ctx.json({ message: "Successfully delete user" }, Status.OK);
    };

    return await handleAppError(deleteMemberImpl)(ctx);
  }

  async getMembers(ctx: Context): Promise<MEMBERS_API> {
    const getMembers = async () => {
      // get userId from decoded JWT
      const clientId = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));
      const limit = parseInt(ctx.req.query("limit") || "10", 10);
      const offset = parseInt(ctx.req.query("offset") || "0", 10);

      console.log(clientId, groupId)

      const members = await this.memberService.getMembers(clientId, groupId, limit, offset);
      console.log(`Members: ${members}`)

      return ctx.json(members, Status.OK);
    };

    return await handleAppError(getMembers)(ctx);
  }
}
