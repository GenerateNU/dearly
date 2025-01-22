import { Context } from "hono";
import { GROUP_API } from "../../types/api/schemas/groups";
import { GroupService } from "./service";
import { createGroupValidate, feedParamValidate } from "./validator";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";

export interface GroupController {
  createGroup(ctx: Context): Promise<GROUP_API>;
  getCalendar(ctx: Context): Promise<Response>;
  getFeed(ctx: Context): Promise<Response>;
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

  async getCalendar(ctx: Context): Promise<Response> {
    return ctx.json({}, Status.Created);
  }

  async getFeed(ctx: Context): Promise<Response> {
    const getFeedImpl = async () => {
      const { date, limit, page } = ctx.req.query();
      const groupId = parseUUID(ctx.req.param("groupId"));
      const parsedParams = feedParamValidate.parse({ date, limit, page });
      const feed = await this.groupService.getFeed({
        ...parsedParams,
        userId: ctx.get("userId"),
        groupId,
      });
      return ctx.json(feed, 200);
    };
    return await handleAppError(getFeedImpl)(ctx);
  }
}
