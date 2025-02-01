import { Context } from "hono";
import { MemberService } from "./service";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import { ADD_MEMBER, DEL_MEMBER, MEMBERS_API, NOTIFICATION } from "../../types/api/routes/members";
import { MemberRole } from "../../constants/database";
import { paginationSchema } from "../../utilities/pagination";

export interface MemberController {
  addMember(ctx: Context): Promise<ADD_MEMBER>;
  deleteMember(ctx: Context): Promise<DEL_MEMBER>;
  getMembers(ctx: Context): Promise<MEMBERS_API>;
  toggleNotification(ctx: Context): Promise<NOTIFICATION>;
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
      const clientId = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.req.param("userId"));

      await this.memberService.deleteMember(clientId, userId, groupId);
      return ctx.json({ message: "Successfully delete user" }, Status.OK);
    };

    return await handleAppError(deleteMemberImpl)(ctx);
  }

  async getMembers(ctx: Context): Promise<MEMBERS_API> {
    const getMembers = async () => {
      // get userId from decoded JWT
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit, page });
      const id = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));
      const members = await this.memberService.getMembers(groupId, { id, ...queryParams });
      return ctx.json(members, Status.OK);
    };

    return await handleAppError(getMembers)(ctx);
  }

  async toggleNotification(ctx: Context): Promise<NOTIFICATION> {
    const toggleNotificationImpl = async () => {
      const userId = ctx.get("userId");
      const groupId = parseUUID(ctx.req.param("id"));
      const notificationOn = await this.memberService.toggleNotification({ userId, id: groupId });
      const message = notificationOn ? "turn on" : "turn off";
      return ctx.json({ message: `Successfully ${message} notification for group` }, Status.OK);
    };
    return await handleAppError(toggleNotificationImpl)(ctx);
  }
}
