import { Context } from "hono";
import { UserService } from "./service";
import { parseUUID } from "../../utilities/api/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import {
  DeleteUserResponse,
  RemoveDeviceTokenResponse,
  UserGroupsResponse,
  SearchedUsersResponse,
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
  AddDeviceTokenResponse,
} from "../../types/api/routes/users";
import { paginationSchema } from "../../utilities/api/pagination";
import {
  createUserValidate,
  expoTokenValidate,
  querySchema,
  updateUserValidate,
} from "../../types/api/internal/users";

export interface UserController {
  createUser(ctx: Context): Promise<CreateUserResponse>;
  getUser(ctx: Context): Promise<GetUserResponse>;
  updateUser(ctx: Context): Promise<UpdateUserResponse>;
  deleteUser(ctx: Context): Promise<DeleteUserResponse>;
  registerDevice(ctx: Context): Promise<AddDeviceTokenResponse>;
  removeDevice(ctx: Context): Promise<RemoveDeviceTokenResponse>;
  getGroups(ctx: Context): Promise<UserGroupsResponse>;
  searchByUsername(ctx: Context): Promise<SearchedUsersResponse>;
}

export class UserControllerImpl implements UserController {
  private userService: UserService;

  constructor(service: UserService) {
    this.userService = service;
  }

  async createUser(ctx: Context): Promise<CreateUserResponse> {
    const createUserImpl = async () => {
      // get userId from decoded JWT
      const userId = ctx.get("userId");
      const payload = createUserValidate.parse(await ctx.req.json());
      const payloadWithId = {
        id: userId,
        ...payload,
      };
      const user = await this.userService.createUser(payloadWithId);
      return ctx.json(user, Status.Created);
    };
    return await handleAppError(createUserImpl)(ctx);
  }

  async getUser(ctx: Context): Promise<GetUserResponse> {
    const getUserImpl = async () => {
      const id = ctx.req.param("id");
      const viewee = parseUUID(id);
      const viewer = ctx.get("userId");
      const user = await this.userService.getUser(viewee, viewer);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(getUserImpl)(ctx);
  }

  async updateUser(ctx: Context): Promise<UpdateUserResponse> {
    const updateUserImpl = async () => {
      // get the userId from decoding JWT
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      const payload = updateUserValidate.parse(await ctx.req.json());
      const user = await this.userService.updateUser(idAsUUID, payload);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(updateUserImpl)(ctx);
  }

  async deleteUser(ctx: Context): Promise<DeleteUserResponse> {
    // get the userId from decoding JWT
    const deleteUserImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      await this.userService.deleteUser(idAsUUID);
      return ctx.json({ message: "Successfully delete user" }, Status.OK);
    };
    return await handleAppError(deleteUserImpl)(ctx);
  }

  async registerDevice(ctx: Context): Promise<AddDeviceTokenResponse> {
    const registerDeviceImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      const parsedBody = expoTokenValidate.parse(await ctx.req.json());
      const user = await this.userService.registerDevice(idAsUUID, parsedBody.expoToken);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(registerDeviceImpl)(ctx);
  }

  async removeDevice(ctx: Context): Promise<RemoveDeviceTokenResponse> {
    const removeDeviceImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      const parsedBody = expoTokenValidate.parse(await ctx.req.json());
      const user = await this.userService.removeDevice(idAsUUID, parsedBody.expoToken);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(removeDeviceImpl)(ctx);
  }

  async getGroups(ctx: Context): Promise<UserGroupsResponse> {
    const getGroupsImpl = async () => {
      const { limit, page } = ctx.req.query();
      const queryParams = paginationSchema.parse({ limit, page });
      const userId = ctx.get("userId");
      const groups = await this.userService.getGroups({ id: userId, ...queryParams });
      return ctx.json(groups, Status.OK);
    };
    return await handleAppError(getGroupsImpl)(ctx);
  }

  async searchByUsername(ctx: Context): Promise<SearchedUsersResponse> {
    const search = async () => {
      const { username, groupId, limit, page } = ctx.req.query();
      const userId = ctx.get("userId");

      // handle validation using zod
      const parsedQuery = querySchema.parse({
        username,
        limit,
        page,
        groupId,
      });

      const result = await this.userService.searchByUsername({
        ...parsedQuery,
        userId,
      });
      return ctx.json(result, Status.OK);
    };
    return await handleAppError(search)(ctx);
  }
}
