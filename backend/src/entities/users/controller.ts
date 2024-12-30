import { Context } from "hono";
import { UserService } from "./service";
import { createUserValidate, updateUserValidate } from "./model";
import { parseUUID } from "../../utilities/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import { CREATE_USER, DEL_USER, GET_USER, PUT_USER } from "../../types/api/routes/users";

export interface UserController {
  createUser(ctx: Context): Promise<CREATE_USER>;
  getUser(ctx: Context): Promise<GET_USER>;
  updateUser(ctx: Context): Promise<PUT_USER>;
  deleteUser(ctx: Context): Promise<DEL_USER>;
}

export class UserControllerImpl implements UserController {
  private userService: UserService;

  constructor(service: UserService) {
    this.userService = service;
  }

  async createUser(ctx: Context): Promise<CREATE_USER> {
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

  async getUser(ctx: Context): Promise<GET_USER> {
    const getUserImpl = async () => {
      const id = ctx.req.param("id");
      const idAsUUID = parseUUID(id);
      const user = await this.userService.getUser(idAsUUID);
      return ctx.json(user, Status.OK);
    };
    return await handleAppError(getUserImpl)(ctx);
  }

  async updateUser(ctx: Context): Promise<PUT_USER> {
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
      return ctx.text("User Successfully Deleted", Status.NoContent);
    };
    return await handleAppError(deleteUserImpl)(ctx);
  }
}
