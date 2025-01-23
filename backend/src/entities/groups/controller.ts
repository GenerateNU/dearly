import { Context } from "hono";
import { GROUP_API } from "../../types/api/schemas/groups";
import { GroupService } from "./service";
import { createGroupValidate, UpdateGroupPayload, updateGroupValidate } from "./validator";
import { Status } from "../../constants/http";
import { handleAppError } from "../../utilities/errors/app-error";
import { DELETE_GROUP, GET_GROUP, PATCH_GROUP } from "../../types/api/routes/groups";
import { parseUUID } from "../../utilities/uuid";

export interface GroupController {
  createGroup(ctx: Context): Promise<GROUP_API>;
  deleteGroup(ctx: Context): Promise<DELETE_GROUP>;
  getGroup(ctx: Context): Promise<GET_GROUP>;
  updateGroup(ctx: Context): Promise<PATCH_GROUP>;
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
        id: groupId,
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
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      const group = await this.groupService.getGroup({ userId, id });
      return ctx.json(group, Status.OK);
    };
    return await handleAppError(getGroupImpl)(ctx);
  }

  async deleteGroup(ctx: Context): Promise<DELETE_GROUP> {
    const deleteGroupImpl = async () => {
      // pull out essential IDs
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      await this.groupService.deleteGroup({ userId, id });
      return ctx.json({ message: "Successfully delete group" }, Status.OK);
    };
    return await handleAppError(deleteGroupImpl)(ctx);
  }
}
