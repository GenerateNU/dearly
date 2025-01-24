import { Context } from "hono";
import { GROUP_API } from "../../types/api/schemas/groups";
import { GroupService } from "./service";
import { calendarParamsValidate, createGroupValidate, feedParamValidate } from "./validator";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { CALENDAR_API, FEED_API } from "../../types/api/routes/groups";

export interface GroupController {
  createGroup(ctx: Context): Promise<GROUP_API>;
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
}
