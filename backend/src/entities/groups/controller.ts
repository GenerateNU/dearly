import { Context } from "hono";
import { GROUP_API } from "../../types/api/schemas/groups";
import { GroupService } from "./service";
import {
  calendarParamsValidate,
  createGroupValidate,
  feedParamValidate,
  updateGroupValidate,
} from "./validator";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import {
  CALENDAR_API,
  DELETE_GROUP,
  FEED_API,
  GET_GROUP,
  PATCH_GROUP,
} from "../../types/api/routes/groups";
import { parseUUID } from "../../utilities/uuid";
import { UpdateGroupPayload } from "../../types/api/internal/groups";

export interface GroupController {
  createGroup(ctx: Context): Promise<GROUP_API>;
  deleteGroup(ctx: Context): Promise<DELETE_GROUP>;
  getGroup(ctx: Context): Promise<GET_GROUP>;
  updateGroup(ctx: Context): Promise<PATCH_GROUP>;
  getCalendar(ctx: Context): Promise<CALENDAR_API>;
  getAllPosts(ctx: Context): Promise<FEED_API>;
}

export class GroupControllerImpl implements GroupController {
  private groupService: GroupService;

  constructor(groupService: GroupService) {
    this.groupService = groupService;
  }

  async createGroup(ctx: Context): Promise<GROUP_API> {
    const createGroupImpl = async () => {
      const body = await ctx.req.json();
      const payload = createGroupValidate.parse(body);

      const userId = ctx.get("userId");
      const newGroup = {
        managerId: userId,
        ...payload,
      };
      const group = await this.groupService.createGroup(newGroup);
      return ctx.json(group, Status.Created);
    };
    return await handleAppError(createGroupImpl)(ctx);
  }

  async getCalendar(ctx: Context): Promise<CALENDAR_API> {
    const getCalendarImpl = async () => {
      const { pivot, range } = ctx.req.query();
      const groupId = parseUUID(ctx.req.param("id"));
      const parsedParams = calendarParamsValidate.parse({ pivot, range });
      const calendar = await this.groupService.getCalendar({
        ...parsedParams,
        userId: ctx.get("userId"),
        groupId,
      });
      return ctx.json(calendar, 200);
    };
    return await handleAppError(getCalendarImpl)(ctx);
  }

  async getAllPosts(ctx: Context): Promise<FEED_API> {
    const getAllPostsImpl = async () => {
      const { date, limit, page } = ctx.req.query();
      const groupId = parseUUID(ctx.req.param("id"));
      const parsedParams = feedParamValidate.parse({ date, limit, page });
      const feed = await this.groupService.getAllPosts({
        ...parsedParams,
        userId: ctx.get("userId"),
        groupId,
      });
      return ctx.json(feed, 200);
    };
    return await handleAppError(getAllPostsImpl)(ctx);
  }

  async updateGroup(ctx: Context): Promise<PATCH_GROUP> {
    const updateGroupImpl = async () => {
      // pull out essential IDs
      const userId = parseUUID(ctx.get("userId"));
      const groupId = parseUUID(ctx.req.param("id"));

      // validate update payload
      const groupInfoPayload = updateGroupValidate.parse(await ctx.req.json());

      // format input to send to service layer
      const updateGroupPayload: UpdateGroupPayload = {
        userId,
        groupId: groupId,
        ...groupInfoPayload,
      };
      const group = await this.groupService.updateGroup(updateGroupPayload);
      return ctx.json(group, Status.OK);
    };
    return await handleAppError(updateGroupImpl)(ctx);
  }

  async getGroup(ctx: Context): Promise<GET_GROUP> {
    const getGroupImpl = async () => {
      // pull out essential IDs
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      const group = await this.groupService.getGroup({ userId, groupId });
      return ctx.json(group, Status.OK);
    };
    return await handleAppError(getGroupImpl)(ctx);
  }

  async deleteGroup(ctx: Context): Promise<DELETE_GROUP> {
    const deleteGroupImpl = async () => {
      // pull out essential IDs
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      await this.groupService.deleteGroup({ groupId, userId });
      return ctx.json({ message: "Successfully delete group" }, Status.OK);
    };
    return await handleAppError(deleteGroupImpl)(ctx);
  }
}
