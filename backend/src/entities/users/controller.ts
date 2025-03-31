import { Context } from "hono";
import { UserService } from "./service";
import { parseUUID } from "../../utilities/api/uuid";
import { handleAppError } from "../../utilities/errors/app-error";
import { Status } from "../../constants/http";
import {
  DeleteUserResponse,
  RemoveDeviceTokenResponse,
  UserGroupsResponse,
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
  AddDeviceTokenResponse,
} from "../../types/api/routes/users";
import { paginationSchema } from "../../utilities/api/pagination";
import {
  createUserValidate,
  expoTokenValidate,
  updateUserValidate,
} from "../../types/api/internal/users";

/**
 * Interface for handling user-related controller operations.
 * Provides methods for creating, retrieving, updating, deleting users,
 * registering and removing device tokens, and searching by username.
 */
export interface UserController {
  /**
   * Creates a new user in the system.
   * @param ctx - The Hono context containing the request data
   * @returns Promise resolving to CreateUserResponse with the created user
   * @throws BadRequestError if validation fails
   */
  createUser(ctx: Context): Promise<CreateUserResponse>;

  /**
   * Retrieves a user's profile data.
   * @param ctx - The Hono context containing the user ID parameter
   * @returns Promise resolving to GetUserResponse with the user data
   * @throws BadRequestError if invalid UUID format
   * @throws NotFoundError if user does not exist
   */
  getUser(ctx: Context): Promise<GetUserResponse>;

  /**
   * Updates an existing user's profile data.
   * @param ctx - The Hono context containing the update payload
   * @returns Promise resolving to UpdateUserResponse with updated user
   * @throws BadRequestError if validation fails
   * @throws NotFoundError if user does not exist
   */
  updateUser(ctx: Context): Promise<UpdateUserResponse>;

  /**
   * Deletes a user from the system.
   * @param ctx - The Hono context containing the user ID
   * @returns Promise resolving to DeleteUserResponse
   * @throws BadRequestError if invalid UUID format
   * @throws NotFoundError if user does not exist
   */
  deleteUser(ctx: Context): Promise<DeleteUserResponse>;

  /**
   * Registers a device token for push notifications.
   * @param ctx - The Hono context containing the token
   * @returns Promise resolving to AddDeviceTokenResponse with token array
   * @throws BadRequestError if validation fails
   */
  registerDevice(ctx: Context): Promise<AddDeviceTokenResponse>;

  /**
   * Removes a device token from push notification registration.
   * @param ctx - The Hono context containing the token
   * @returns Promise resolving to RemoveDeviceTokenResponse with remaining tokens
   * @throws BadRequestError if validation fails
   */
  removeDevice(ctx: Context): Promise<RemoveDeviceTokenResponse>;

  /**
   * Retrieves paginated groups for a user.
   * @param ctx - The Hono context containing pagination params
   * @returns Promise resolving to UserGroupsResponse with groups array
   * @throws BadRequestError if validation fails
   */
  getGroups(ctx: Context): Promise<UserGroupsResponse>;
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
}
