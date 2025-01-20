import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import {
  CreateUserPayload,
  SearchedInfo,
  SearchedUser,
  UpdateUserPayload,
  User,
  Pagination,
} from "./validator";
import { UserTransaction } from "./transaction";
import { PostWithMedia } from "../posts/validator";
import { Group } from "../groups/validator";

export interface UserService {
  createUser(payload: CreateUserPayload): Promise<User>;
  getUser(id: string): Promise<User>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User>;
  deleteUser(id: string): Promise<void>;
  registerDevice(id: string, expoToken: string): Promise<string[]>;
  removeDevice(id: string, expoToken: string): Promise<string[]>;
  getPosts(payload: Pagination): Promise<PostWithMedia[]>;
  getGroups(payload: Pagination): Promise<Group[]>;
  searchByUsername(payload: SearchedInfo): Promise<SearchedUser[]>;
}

export class UserServiceImpl implements UserService {
  private userTransaction: UserTransaction;

  constructor(UserTransaction: UserTransaction) {
    this.userTransaction = UserTransaction;
  }

  async createUser(payload: CreateUserPayload): Promise<User> {
    const createUserImpl = async () => {
      const user = await this.userTransaction.insertUser({
        ...payload,
      });
      if (!user) {
        throw new InternalServerError("Failed to create user");
      }
      return user;
    };
    return handleServiceError(createUserImpl)();
  }

  async getUser(id: string): Promise<User> {
    const getUserImpl = async () => {
      const user = await this.userTransaction.selectUser(id);
      if (!user) {
        throw new NotFoundError("User");
      }
      return user;
    };
    return handleServiceError(getUserImpl)();
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const updateUserImpl = async () => {
      const user = await this.userTransaction.updateUser(id, payload);
      if (!user) {
        throw new NotFoundError("User");
      }
      return user;
    };
    return handleServiceError(updateUserImpl)();
  }

  async deleteUser(id: string): Promise<void> {
    const deleteUserImpl = async () => {
      await this.userTransaction.deleteUser(id);
    };
    return handleServiceError(deleteUserImpl)();
  }

  async registerDevice(id: string, expoToken: string): Promise<string[]> {
    const registerDevieceImpl = async () => {
      const devices = await this.userTransaction.insertDeviceToken(id, expoToken);
      return devices;
    };
    return handleServiceError(registerDevieceImpl)();
  }

  async removeDevice(id: string, expoToken: string): Promise<string[]> {
    const removeDeviceImpl = async () => {
      const devices = await this.userTransaction.deleteDeviceToken(id, expoToken);
      return devices;
    };
    return handleServiceError(removeDeviceImpl)();
  }

  async getPosts(payload: Pagination): Promise<PostWithMedia[]> {
    const getPostsImpl = async () => {
      return await this.userTransaction.getPosts(payload);
    };
    return handleServiceError(getPostsImpl)();
  }

  async getGroups(payload: Pagination): Promise<Group[]> {
    const getGroupsImpl = async () => {
      return await this.userTransaction.getGroups(payload);
    };
    return handleServiceError(getGroupsImpl)();
  }

  async searchByUsername(payload: SearchedInfo): Promise<SearchedUser[]> {
    const search = async () => {
      return await this.userTransaction.getUsersByUsername(payload);
    };
    return handleServiceError(search)();
  }
}
