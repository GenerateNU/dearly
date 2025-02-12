import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { nudgeScheduleValidate, userIDValidate } from "./validator";
import { parseUUID } from "../../utilities/uuid";
import {
  AUTO_NUDGE,
  DEACTIVE_NUDGE,
  MANUAL_NUDGE,
  NUDGES_API,
} from "../../types/api/routes/nudges";

export interface NudgeController {
  manualNudge(ctx: Context): Promise<MANUAL_NUDGE>;
  upsertSchedule(ctx: Context): Promise<AUTO_NUDGE>;
  getSchedule(ctx: Context): Promise<NUDGES_API>;
  deactivateSchedule(ctx: Context): Promise<DEACTIVE_NUDGE>;
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

  async upsertSchedule(ctx: Context): Promise<AUTO_NUDGE> {
    const upsertScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      const payload = nudgeScheduleValidate.parse(await ctx.req.json());
      const payloadWithIds = {
        groupId: groupId,
        ...payload,
      };
      await this.nudgeService.upsertSchedule(managerId, payloadWithIds);
      return ctx.json({ message: "Successfully updated automatic nudge schedule" }, 200);
    };
    return await handleAppError(upsertScheduleImpl)(ctx);
  }

  async getSchedule(ctx: Context): Promise<NUDGES_API> {
    const getScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      const schedule = await this.nudgeService.getSchedule(groupId, managerId);
      if (schedule) {
        return ctx.json(schedule, 200);
      }
      return ctx.json({ message: "Group did not have schedule configured" }, 200);
    };
    return await handleAppError(getScheduleImpl)(ctx);
  }

  async deactivateSchedule(ctx: Context): Promise<DEACTIVE_NUDGE> {
    const deactivateScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      const schedule = await this.nudgeService.deactivateNudge(groupId, managerId);
      if (schedule) {
        return ctx.json(schedule, 200);
      }
      return ctx.json({ message: "Nudge schedule not configured for deactivation" }, 200);
    };
    return await handleAppError(deactivateScheduleImpl)(ctx);
  }
}
