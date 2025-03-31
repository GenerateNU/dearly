import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { UserTransaction } from "./transaction";
import {
  CreateUserPayload,
  Pagination,
  UpdateUserPayload,
  User,
} from "../../types/api/internal/users";
import { MediaService } from "../media/service";
import { Group } from "../../types/api/internal/groups";

/**
 * Interface for handling user-related business logic and service operations.
 * Provides methods for managing users, their devices, groups, and search functionality.
 */
export interface UserService {
  /**
   * Creates a new user in the system.
   * @param payload - User creation data including id, name, username, etc.
   * @returns Promise resolving to the created User
   * @throws InternalServerError if user creation fails
   */
  createUser(payload: CreateUserPayload): Promise<User>;

  /**
   * Retrieves a user's profile data, considering viewer permissions.
   * @param viewee - ID of the user being viewed
   * @param viewer - ID of the user viewing the profile
   * @returns Promise resolving to the User data with signed profile photo URL
   * @throws NotFoundError if user does not exist
   */
  getUser(viewee: string, viewer: string): Promise<User>;

  /**
   * Updates an existing user's profile data.
   * @param id - ID of the user to update
   * @param payload - Updated user data
   * @returns Promise resolving to the updated User
   * @throws NotFoundError if user does not exist
   */
  updateUser(id: string, payload: UpdateUserPayload): Promise<User>;

  /**
   * Deletes a user from the system.
   * @param id - ID of the user to delete
   * @returns Promise resolving when deletion is complete
   * @throws NotFoundError if user does not exist
   */
  deleteUser(id: string): Promise<void>;

  /**
   * Registers a device token for push notifications.
   * @param id - User ID to associate the token with
   * @param expoToken - Expo push notification token
   * @returns Promise resolving to array of user's device tokens
   */
  registerDevice(id: string, expoToken: string): Promise<string[]>;

  /**
   * Removes a device token from push notification registration.
   * @param id - User ID associated with the token
   * @param expoToken - Expo push notification token to remove
   * @returns Promise resolving to remaining array of user's device tokens
   */
  removeDevice(id: string, expoToken: string): Promise<string[]>;

  /**
   * Retrieves groups with pagination.
   * @param payload - Pagination parameters
   * @returns Promise resolving to array of Groups
   */
  getGroups(payload: Pagination): Promise<Group[]>;
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

  async getGroups(payload: Pagination): Promise<Group[]> {
    const getGroupsImpl = async () => {
      return await this.userTransaction.getGroups(payload);
    };
    return handleServiceError(getGroupsImpl)();
  }
}
