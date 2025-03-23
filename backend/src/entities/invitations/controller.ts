import { Context } from "hono";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import { InvitationService } from "./service";
import { CreateInviteResponse, VerifyTokenResponse } from "../../types/api/routes/invite";

export interface InvitationController {
  createInviteToken(ctx: Context): Promise<CreateInviteResponse>;
  verifyInviteToken(ctx: Context): Promise<VerifyTokenResponse>;
}

export class InvitationControllerImpl implements InvitationController {
  private invitationService: InvitationService;

  constructor(invitationService: InvitationService) {
    this.invitationService = invitationService;
  }

  async verifyInviteToken(ctx: Context): Promise<VerifyTokenResponse> {
    const verifyInviteTokenImpl = async () => {
      const userId = ctx.get("userId");
      const token = ctx.req.param("token");
      await this.invitationService.verifyInviteToken(token, userId);
      return ctx.json({ message: "Successfully added to group" }, Status.OK);
    };
    return await handleAppError(verifyInviteTokenImpl)(ctx);
  }

  async createInviteToken(ctx: Context): Promise<CreateInviteResponse> {
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
