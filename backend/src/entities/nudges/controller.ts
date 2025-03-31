import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import {
  AutoNudgeResponse,
  DeactivateNudgeResponse,
  ManualNudgeResponse,
  GetNudgeConfigResponse,
} from "../../types/api/routes/nudges";
import { nudgeScheduleValidate, userIDValidate } from "../../types/api/internal/nudges";
import { Status } from "../../constants/http";

/**
 * Interface defining the operations available for managing nudges in the application.
 * It includes methods for sending manual nudges, creating or updating nudge schedules,
 * retrieving the current schedule, and deactivating a schedule.
 */
export interface NudgeController {
  /**
   * Sends a manual nudge to specific users in a group.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the response indicating the success of the manual nudge
   */
  manualNudge(ctx: Context): Promise<ManualNudgeResponse>;

  /**
   * Creates or updates a nudge schedule for a group.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the response indicating the success of the schedule update
   */
  upsertSchedule(ctx: Context): Promise<AutoNudgeResponse>;

  /**
   * Retrieves the current nudge schedule for a group.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the response indicating the success of the schedule retrieval
   */
  getSchedule(ctx: Context): Promise<GetNudgeConfigResponse>;

  /**
   * Deactivates a nudge schedule for a group.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the response indicating the success of the schedule deactivation
   */
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
      return ctx.json(schedule, Status.OK);
    };
    return await handleAppError(upsertScheduleImpl)(ctx);
  }

  async getSchedule(ctx: Context): Promise<GetNudgeConfigResponse> {
    const getScheduleImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const managerId = ctx.get("userId");
      const schedule = await this.nudgeService.getSchedule(groupId, managerId);
      if (schedule) {
        return ctx.json(schedule, Status.OK);
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
        return ctx.json(schedule, Status.OK);
      }
      return ctx.json({ message: "Nudge schedule not configured for deactivation" }, 200);
    };
    return await handleAppError(deactivateScheduleImpl)(ctx);
  }
}
