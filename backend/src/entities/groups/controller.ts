import { Context } from "hono";
import { GroupService } from "./service";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import {
  GroupCalendarResponse,
  DeleteGroupResponse,
  GetGroupResponse,
  CreateGroupResponse,
  UpdateGroupResponse,
  GroupFeedResponse,
} from "../../types/api/routes/groups";
import { parseUUID } from "../../utilities/api/uuid";
import {
  calendarParamsValidate,
  createGroupValidate,
  feedParamValidate,
  UpdateGroupPayload,
  updateGroupValidate,
} from "../../types/api/internal/groups";

export interface GroupController {
  createGroup(ctx: Context): Promise<CreateGroupResponse>;
  deleteGroup(ctx: Context): Promise<DeleteGroupResponse>;
  getGroup(ctx: Context): Promise<GetGroupResponse>;
  updateGroup(ctx: Context): Promise<UpdateGroupResponse>;
  getCalendar(ctx: Context): Promise<GroupCalendarResponse>;
  getAllPosts(ctx: Context): Promise<GroupFeedResponse>;
}

export class GroupControllerImpl implements GroupController {
  private groupService: GroupService;

  constructor(groupService: GroupService) {
    this.groupService = groupService;
  }

  async createGroup(ctx: Context): Promise<CreateGroupResponse> {
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

  async getCalendar(ctx: Context): Promise<GroupCalendarResponse> {
    const getCalendarImpl = async () => {
      const { pivot, range, tmzOffset } = ctx.req.query();
      const groupId = parseUUID(ctx.req.param("id"));
      const parsedParams = calendarParamsValidate.parse({ pivot, range, tmzOffset });

      const calendar = await this.groupService.getCalendar({
        ...parsedParams,
        userId: ctx.get("userId"),
        groupId,
      });
      return ctx.json(calendar, Status.OK);
    };
    return await handleAppError(getCalendarImpl)(ctx);
  }

  async getAllPosts(ctx: Context): Promise<GroupFeedResponse> {
    const getAllPostsImpl = async () => {
      const { date, limit, page } = ctx.req.query();
      const groupId = parseUUID(ctx.req.param("id"));
      const parsedParams = feedParamValidate.parse({ date, limit, page });
      const feed = await this.groupService.getAllPosts({
        ...parsedParams,
        userId: ctx.get("userId"),
        groupId,
      });
      return ctx.json(feed, Status.OK);
    };
    return await handleAppError(getAllPostsImpl)(ctx);
  }

  async updateGroup(ctx: Context): Promise<UpdateGroupResponse> {
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

  async getGroup(ctx: Context): Promise<GetGroupResponse> {
    const getGroupImpl = async () => {
      // pull out essential IDs
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      const group = await this.groupService.getGroup({ userId, groupId });
      return ctx.json(group, Status.OK);
    };
    return await handleAppError(getGroupImpl)(ctx);
  }

  async deleteGroup(ctx: Context): Promise<DeleteGroupResponse> {
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
