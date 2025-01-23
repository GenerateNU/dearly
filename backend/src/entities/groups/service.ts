import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { IDPayload } from "../posts/validator";
import { GroupTransaction } from "./transaction";
import { CreateGroupPayload, Group, UpdateGroupPayload } from "./validator";

export interface GroupService {
  createGroup(payload: CreateGroupPayload): Promise<Group>;
  deleteGroup(payload: IDPayload): Promise<void>;
  getGroup(payload: IDPayload): Promise<Group>;
  updateGroup(payload: UpdateGroupPayload): Promise<Group>;
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

  async updateGroup(payload: UpdateGroupPayload): Promise<Group> {
    const updateGroupImpl = async () => {
      const updatedGroup = await this.groupTransaction.updateGroup(payload);
      if (!updatedGroup) {
        throw new NotFoundError("Group");
      }
      return updatedGroup;
    };
    return await handleServiceError(updateGroupImpl)();
  }

  async getGroup(payload: IDPayload): Promise<Group> {
    const getGroupImpl = async () => {
      const group = await this.groupTransaction.getGroup(payload);
      if (!group) {
        throw new NotFoundError("Group");
      }
      return group;
    };
    return await handleServiceError(getGroupImpl)();
  }

  async deleteGroup({ id, userId }: IDPayload): Promise<void> {
    const deleteGroupimpl = async () => {
      await this.groupTransaction.deleteGroup(id, userId);
    };
    return await handleServiceError(deleteGroupimpl)();
  }
}
