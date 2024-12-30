import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { CreateUserPayload, UpdateUserPayload, User } from "./model";
import { UserTransaction } from "./transaction";

export interface UserService {
  createUser(payload: CreateUserPayload): Promise<User>;
  getUser(id: string): Promise<User>;
  updateUser(id: string, payload: UpdateUserPayload): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class UserServiceImpl implements UserService {
  private userTransaction: UserTransaction;

  constructor(UserTransaction: UserTransaction) {
    this.userTransaction = UserTransaction;
  }

  async createUser(payload: CreateUserPayload): Promise<User> {
    const createUserImpl = async () => {
      const user = await this.userTransaction.insertUser(payload);
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
}
