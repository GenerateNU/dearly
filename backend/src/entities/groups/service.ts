import {
  CalendarParamPayload,
  CreateGroupPayload,
  FeedParamPayload,
  Group,
  GroupIdPayload,
  ThumbnailResponseWithURL,
  UpdateGroupPayload,
} from "../../types/api/internal/groups";
import { PostWithMediaURL } from "../../types/api/internal/posts";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { GroupTransaction } from "./transaction";

export interface GroupService {
  createGroup(payload: CreateGroupPayload): Promise<Group>;
  deleteGroup(payload: GroupIdPayload): Promise<void>;
  getGroup(payload: GroupIdPayload): Promise<Group>;
  updateGroup(payload: UpdateGroupPayload): Promise<Group>;
  getAllPosts(payload: FeedParamPayload): Promise<PostWithMediaURL[]>;
  getCalendar(payload: CalendarParamPayload): Promise<ThumbnailResponseWithURL[]>;
}

export class GroupServiceImpl implements GroupService {
  private groupTransaction: GroupTransaction;
  private mediaService: MediaService;

  constructor(groupTransaction: GroupTransaction, mediaService: MediaService) {
    this.groupTransaction = groupTransaction;
    this.mediaService = mediaService;
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

  async getAllPosts(payload: FeedParamPayload): Promise<PostWithMediaURL[]> {
    const getAllPostsImpl = async () => {
      const posts = await this.groupTransaction.getAllPosts(payload);
      const postsWithUrls = await Promise.all(
        posts.map(this.mediaService.getPostWithMediaUrls.bind(this.mediaService)),
      );
      return postsWithUrls;
    };
    return handleServiceError(getAllPostsImpl)();
  }

  async getCalendar(payload: CalendarParamPayload): Promise<ThumbnailResponseWithURL[]> {
    const getCalendarImpl = async () => {
      const thumbnails = await this.groupTransaction.getCalendar(payload);
      const thumbnailWithUrls = await this.mediaService.getThumbnailsWithSignedUrls(thumbnails);
      return thumbnailWithUrls;
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
