import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { userIDValidate } from "./validator";
import { parseUUID } from "../../utilities/uuid";
import { MANUAL_NUDGE } from "../../types/api/routes/nudges";

export interface NudgeController {
  manualNudge(ctx: Context): Promise<MANUAL_NUDGE>;
}

export class NudgeControllerImpl implements NudgeController {
  private nudgeService: NudgeService;

  constructor(nudgeService: NudgeService) {
    this.nudgeService = nudgeService;
  }

  async manualNudge(ctx: Context): Promise<MANUAL_NUDGE> {
    const manualNudgeImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      // validate userIds
      const nudgedUserIds = userIDValidate.parse(await ctx.req.json());
      await this.nudgeService.manualNudge(nudgedUserIds.users, groupId, managerId);
      return ctx.json({ message: "Successfully nudge selected users" }, 200);
    };
    return await handleAppError(manualNudgeImpl)(ctx);
  }
}
