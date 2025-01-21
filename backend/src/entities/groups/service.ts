import { InternalServerError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { IDPayload } from "../posts/validator";
import { GroupTransaction } from "./transaction";
import { CreateGroupPayload, Group } from "./validator";

export interface GroupService {
  createGroup(payload: CreateGroupPayload): Promise<Group>;
  deleteGroup(payload: IDPayload): Promise<void>;
}

export class GroupServiceImpl implements GroupService {
  private groupTransaction: GroupTransaction;

  constructor(groupTransaction: GroupTransaction) {
    this.groupTransaction = groupTransaction;
  }

  async createGroup(payload: CreateGroupPayload): Promise<Group> {
    const createGroupImpl = async () => {
      const group = await this.groupTransaction.insertGroup(payload);
      if (!group) {
        throw new InternalServerError("Failed to create group");
      }
      return group;
    };
    return handleServiceError(createGroupImpl)();
  }

  async deleteGroup({ id, userId }: IDPayload): Promise<void> {
    const deletePostImpl = async () => {
      await this.groupTransaction.deleteGroup(id, userId);
    };
    return await handleServiceError(deletePostImpl)();
  }
}
