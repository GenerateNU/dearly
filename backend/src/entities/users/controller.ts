import { Context } from "hono";
import { UserService } from "./service";
import { createUserValidate, expoTokenValidate, updateUserValidate } from "./validator";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import { DEL_USER, USER_RESPONSE } from "../../types/api/routes/users";

export interface UserController {
  createUser(ctx: Context): Promise<USER_RESPONSE>;
  getUser(ctx: Context): Promise<USER_RESPONSE>;
  updateUser(ctx: Context): Promise<USER_RESPONSE>;
  deleteUser(ctx: Context): Promise<DEL_USER>;
  registerDevice(ctx: Context): Promise<USER_RESPONSE>;
  removeDevice(ctx: Context): Promise<USER_RESPONSE>;
}

export class UserControllerImpl implements UserController {
  private userService: UserService;

  constructor(service: UserService) {
    this.userService = service;
  }

  async createUser(ctx: Context): Promise<USER_RESPONSE> {
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

  async getUser(ctx: Context): Promise<USER_RESPONSE> {
    const getUserImpl = async () => {
      const id = ctx.req.param("id");
      const idAsUUID = parseUUID(id);
      const user = await this.userService.getUser(idAsUUID);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(getUserImpl)(ctx);
  }

  async updateUser(ctx: Context): Promise<USER_RESPONSE> {
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

  async deleteUser(ctx: Context): Promise<DEL_USER> {
    // get the userId from decoding JWT
    const deleteUserImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      await this.userService.deleteUser(idAsUUID);
      return ctx.json({ message: "Successfully delete user" }, Status.OK);
    };
    return await handleAppError(deleteUserImpl)(ctx);
  }

  async registerDevice(ctx: Context): Promise<USER_RESPONSE> {
    const registerDeviceImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      const parsedBody = expoTokenValidate.parse(await ctx.req.json());
      const user = await this.userService.registerDevice(idAsUUID, parsedBody.expoToken);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(registerDeviceImpl)(ctx);
  }

  async removeDevice(ctx: Context): Promise<USER_RESPONSE> {
    const removeDeviceImpl = async () => {
      const userId = ctx.get("userId");
      const idAsUUID = parseUUID(userId);
      const parsedBody = expoTokenValidate.parse(await ctx.req.json());
      const user = await this.userService.removeDevice(idAsUUID, parsedBody.expoToken);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(removeDeviceImpl)(ctx);
  }
}
