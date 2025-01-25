import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { PostWithMedia } from "../posts/validator";
import { GroupTransaction } from "./transaction";
import {
  CreateGroupPayload,
  Group,
  GroupIdPayload,
  UpdateGroupPayload,
  CalendarParamPayload,
  FeedParamPayload,
  ThumbnailResponse,
} from "./validator";

export interface GroupService {
  createGroup(payload: CreateGroupPayload): Promise<Group>;
  deleteGroup(payload: GroupIdPayload): Promise<void>;
  getGroup(payload: GroupIdPayload): Promise<Group>;
  updateGroup(payload: UpdateGroupPayload): Promise<Group>;
  getAllPosts(payload: FeedParamPayload): Promise<PostWithMedia[]>;
  getCalendar(payload: CalendarParamPayload): Promise<ThumbnailResponse[]>;
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

  async getAllPosts(payload: FeedParamPayload): Promise<PostWithMedia[]> {
    const getAllPostsImpl = async () => {
      return await this.groupTransaction.getAllPosts(payload);
    };
    return handleServiceError(getAllPostsImpl)();
  }

  async getCalendar(payload: CalendarParamPayload): Promise<ThumbnailResponse[]> {
    const getCalendarImpl = async () => {
      return await this.groupTransaction.getCalendar(payload);
    };
    return handleServiceError(getCalendarImpl)();
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

  async getGroup(payload: GroupIdPayload): Promise<Group> {
    const getGroupImpl = async () => {
      const group = await this.groupTransaction.getGroup(payload);
      if (!group) {
        throw new NotFoundError("Group");
      }
      return group;
    };
    return await handleServiceError(getGroupImpl)();
  }

  async deleteGroup({ groupId, userId }: GroupIdPayload): Promise<void> {
    const deleteGroupimpl = async () => {
      await this.groupTransaction.deleteGroup(groupId, userId);
    };
    return await handleServiceError(deleteGroupimpl)();
  }
}
