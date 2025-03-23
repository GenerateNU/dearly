import { Context } from "hono";
import { MemberService } from "./service";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import {
  AddMemberResponse,
  GetAMemberResponse,
  DeleteMemberResponse,
  GetMemberPostsResponse,
  GetMembersResponse,
  UpdateNotificationResponse,
} from "../../types/api/routes/members";
import { MemberRole } from "../../constants/database";
import { paginationSchema } from "../../utilities/pagination";
import { notificationValidate } from "./validator";

export interface MemberController {
  addMember(ctx: Context): Promise<AddMemberResponse>;
  getMember(ctx: Context): Promise<GetAMemberResponse>;
  deleteMember(ctx: Context): Promise<DeleteMemberResponse>;
  getMembers(ctx: Context): Promise<GetMembersResponse>;
  getMemberPosts(ctx: Context): Promise<GetMemberPostsResponse>;
  toggleNotification(ctx: Context): Promise<UpdateNotificationResponse>;
}

export class MemberControllerImpl implements MemberController {
  private memberService: MemberService;

  constructor(service: MemberService) {
    this.memberService = service;
  }

  async addMember(ctx: Context): Promise<AddMemberResponse> {
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

  async getMember(ctx: Context): Promise<GetAMemberResponse> {
    const getMemberImp = async () => {
      const userId = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));

      const member = await this.memberService.getMember({ id: groupId, userId });
      return ctx.json(member, Status.OK);
    };
    return await handleAppError(getMemberImp)(ctx);
  }

  async deleteMember(ctx: Context): Promise<DeleteMemberResponse> {
    const deleteMemberImpl = async () => {
      const clientId = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.req.param("userId"));

      await this.memberService.deleteMember(clientId, userId, groupId);
      return ctx.json({ message: "Successfully delete user" }, Status.OK);
    };

    return await handleAppError(deleteMemberImpl)(ctx);
  }

  async getMembers(ctx: Context): Promise<GetMembersResponse> {
    const getMembersImpl = async () => {
      // get userId from decoded JWT
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit, page });
      const id = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));
      const members = await this.memberService.getMembers(groupId, { id, ...queryParams });
      return ctx.json(members, Status.OK);
    };

    return await handleAppError(getMembersImpl)(ctx);
  }

  async getMemberPosts(ctx: Context): Promise<GetMemberPostsResponse> {
    const getMemberPostsImpl = async () => {
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit, page });
      const viewee = parseUUID(ctx.req.param("userId"));
      const viewer = ctx.get("userId");
      const groupId = parseUUID(ctx.req.param("id"));

      const posts = await this.memberService.getMemberPosts(
        { id: viewee, ...queryParams },
        viewer,
        groupId,
      );
      return ctx.json(posts, Status.OK);
    };
    return await handleAppError(getMemberPostsImpl)(ctx);
  }

  async toggleNotification(ctx: Context): Promise<UpdateNotificationResponse> {
    const toggleNotificationImpl = async () => {
      const userId = ctx.get("userId");
      const groupId = parseUUID(ctx.req.param("id"));

      const notificationConfig = notificationValidate.parse(await ctx.req.json());
      const response = await this.memberService.toggleNotification({
        id: groupId,
        userId,
        ...notificationConfig,
      });
      return ctx.json(response, Status.OK);
    };
    return await handleAppError(toggleNotificationImpl)(ctx);
  }
}
