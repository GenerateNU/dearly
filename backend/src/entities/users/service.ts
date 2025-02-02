import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { UserTransaction } from "./transaction";
import {
  CreateUserPayload,
  Pagination,
  SearchedInfo,
  SearchedUser,
  UpdateUserPayload,
  User,
} from "../../types/api/internal/users";
import { PostWithMediaURL } from "../../types/api/internal/posts";
import { MediaService } from "../media/service";
import { Group } from "../../types/api/internal/groups";

export interface UserService {
  createUser(payload: CreateUserPayload): Promise<User>;
  getUser(viewee: string, viewer: string): Promise<User>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User>;
  deleteUser(id: string): Promise<void>;
  registerDevice(id: string, expoToken: string): Promise<string[]>;
  removeDevice(id: string, expoToken: string): Promise<string[]>;
  getPosts(payload: Pagination, viewer: string): Promise<PostWithMediaURL[]>;
  getGroups(payload: Pagination): Promise<Group[]>;
  searchByUsername(payload: SearchedInfo): Promise<SearchedUser[]>;
}

export class UserServiceImpl implements UserService {
  private userTransaction: UserTransaction;
  private mediaService: MediaService;

  constructor(UserTransaction: UserTransaction, mediaService: MediaService) {
    this.userTransaction = UserTransaction;
    this.mediaService = mediaService;
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

  async getUser(viewee: string, viewer: string): Promise<User> {
    const getUserImpl = async () => {
      const user = await this.userTransaction.selectUser(viewee, viewer);
      if (!user) {
        throw new NotFoundError("User");
      }
      const userWithProfileURL = await this.mediaService.getUserWithSignedURL(user);
      return userWithProfileURL;
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

  async getPosts(payload: Pagination, viewer: string): Promise<PostWithMediaURL[]> {
    const getPostsImpl = async () => {
      const posts = await this.userTransaction.getPosts(payload, viewer);
      const postsWithUrls = await Promise.all(
        posts.map(this.mediaService.getPostWithMediaUrls.bind(this.mediaService)),
      );
      return postsWithUrls;
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
      const users = await this.userTransaction.getUsersByUsername(payload);
      const usersWithProfileURLs = await this.mediaService.getUsersWithSignedURL(users);
      return usersWithProfileURLs;
    };
    return handleServiceError(search)();
  }
}
