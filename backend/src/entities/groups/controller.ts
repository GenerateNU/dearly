import { Context } from "hono";
import { GROUP_API } from "../../types/api/schemas/groups";
import { GroupService } from "./service";
import { createGroupValidate } from "./validator";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";

export interface GroupController {
  createGroup(ctx: Context): Promise<GROUP_API>;
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
}
