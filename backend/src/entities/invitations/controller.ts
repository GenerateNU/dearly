import { Context } from "hono";
import { Status } from "../../constants/http";
import { CREATE_GROUP_INVITE, VERIFY_GROUP_INVITE } from "../../types/api/schemas/groups";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { InvitationService } from "./service";

export interface InvitationController {
  createInviteToken(ctx: Context): Promise<CREATE_GROUP_INVITE>;
  verifyInviteToken(ctx: Context): Promise<VERIFY_GROUP_INVITE>;
}

export class InvitationControllerImpl implements InvitationController {
  private invitationService: InvitationService;

  constructor(invitationService: InvitationService) {
    this.invitationService = invitationService;
  }
  async verifyInviteToken(ctx: Context): Promise<VERIFY_GROUP_INVITE> {
    const verifyInviteTokenImpl = async () => {
      const userId = ctx.get("userId");
      const token = ctx.req.param("token");
      await this.invitationService.verifyInviteToken(token, userId);
      return ctx.json({ message: "Successfully added to group" }, Status.OK);
    };
    return await handleAppError(verifyInviteTokenImpl)(ctx);
  }

  async createInviteToken(ctx: Context): Promise<CREATE_GROUP_INVITE> {
    const createInviteTokenImpl = async () => {
      const groupId = ctx.req.param("groupId");
      const groupIdAsUUID = parseUUID(groupId);
      const userId = ctx.get("userId");
      const invite = await this.invitationService.createInviteToken(groupIdAsUUID, userId);
      return ctx.json(invite, Status.OK);
    };
    return await handleAppError(createInviteTokenImpl)(ctx);
  }
}
