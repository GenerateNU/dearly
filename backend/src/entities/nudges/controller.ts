import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { userIDValidate } from "./validator";

export interface NudgeController {
  manualNudge(ctx: Context): Promise<Response>;
}

export class NudgeControllerImpl implements NudgeController {
  private nudgeService: NudgeService;

  constructor(nudgeService: NudgeService) {
    this.nudgeService = nudgeService;
  }

  async manualNudge(ctx: Context): Promise<Response> {
    const manualNudgeImpl = async () => {
      // validate userIds
      const nudgedUserIds = userIDValidate.parse(await ctx.req.json());
      await this.nudgeService.manualNudge(nudgedUserIds);
      return ctx.json({ message: "Successfully nudge selected users" }, 200);
    };
    return await handleAppError(manualNudgeImpl)(ctx);
  }
}
