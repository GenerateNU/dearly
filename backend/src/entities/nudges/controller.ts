import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { nudgeScheduleValidate, userIDValidate } from "./validator";
import { parseUUID } from "../../utilities/uuid";
import {
  AutoNudgeResponse,
  DeactivateNudgeResponse,
  ManualNudgeResponse,
  GetNudgeConfigResponse,
} from "../../types/api/routes/nudges";

export interface NudgeController {
  manualNudge(ctx: Context): Promise<ManualNudgeResponse>;
  upsertSchedule(ctx: Context): Promise<AutoNudgeResponse>;
  getSchedule(ctx: Context): Promise<GetNudgeConfigResponse>;
  deactivateSchedule(ctx: Context): Promise<DeactivateNudgeResponse>;
}

export class NudgeControllerImpl implements NudgeController {
  private nudgeService: NudgeService;

  constructor(nudgeService: NudgeService) {
    this.nudgeService = nudgeService;
  }

  async manualNudge(ctx: Context): Promise<ManualNudgeResponse> {
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

  async upsertSchedule(ctx: Context): Promise<AutoNudgeResponse> {
    const upsertScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      const payload = nudgeScheduleValidate.parse(await ctx.req.json());
      const payloadWithIds = {
        groupId: groupId,
        ...payload,
      };
      const schedule = await this.nudgeService.upsertSchedule(managerId, payloadWithIds);
      return ctx.json(schedule, 200);
    };
    return await handleAppError(upsertScheduleImpl)(ctx);
  }

  async getSchedule(ctx: Context): Promise<GetNudgeConfigResponse> {
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

  async deactivateSchedule(ctx: Context): Promise<DeactivateNudgeResponse> {
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
