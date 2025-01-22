import { InternalServerError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { PostWithMedia } from "../posts/validator";
import { GroupTransaction } from "./transaction";
import {
  CalendarParamPayload,
  CreateGroupPayload,
  FeedParamPayload,
  Group,
  ThumbnailResponse,
} from "./validator";

export interface GroupService {
  createGroup(payload: CreateGroupPayload): Promise<Group>;
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
}
