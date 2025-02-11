import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { userIDValidate } from "./validator";
import { parseUUID } from "../../utilities/uuid";
import { AUTO_NUDGE, DEACTIVE_NUDGE, MANUAL_NUDGE, NUDGES_API } from "../../types/api/routes/nudges";

export interface NudgeController {
  manualNudge(ctx: Context): Promise<MANUAL_NUDGE>;
  createSchedule(ctx: Context): Promise<AUTO_NUDGE>;
  getSchedule(ctx: Context): Promise<NUDGES_API>;
  deactivateSchedule(ctx:Context): Promise<DEACTIVE_NUDGE>;
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

  async createSchedule(ctx: Context): Promise<AUTO_NUDGE> {
    const createScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");

      const payload = await ctx.req.json(); // TODO: validate

      const payloadWithIds = {
        groupId: groupId,
        ...payload
      }

      await this.nudgeService.createSchedule(managerId, payloadWithIds);
      return ctx.json({ message: "Successfully created automatic nudge schedule" }, 200);
    }
    return await handleAppError(createScheduleImpl)(ctx);
  }

  async getSchedule(ctx: Context): Promise<NUDGES_API> {
    throw new Error("Method not implemented.");
  }

  async deactivateSchedule(ctx: Context): Promise<DEACTIVE_NUDGE> {
    throw new Error("Method not implemented.");
  }


}
