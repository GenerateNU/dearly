import { NotificationConfigPayload } from "../../types/api/internal/notification";
import { AddMemberPayload, Member } from "../../types/api/internal/members";
import { PostWithMediaURL } from "../../types/api/internal/posts";
import { Pagination, SearchedUser } from "../../types/api/internal/users";
import { IDPayload } from "../../types/api/internal/id";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { MemberTransaction } from "./transaction";

/**
 * Interface defining the operations available for managing members in the application.
 * It includes methods for adding a member, retrieving a member, deleting a member,
 * retrieving members of a group, toggling notification settings, and retrieving posts of a member.
 */
export interface MemberService {
  /**
   * Adds a member to a group.
   * @param payload - Object containing member information
   * @returns Promise resolving to the added Member object
   */
  addMember(payload: AddMemberPayload): Promise<Member>;

  /**
   * Retrieves a member by their ID.
   * @param payload - Object containing group ID and user ID to look up
   * @returns Promise resolving to the Member object
   */
  getMember(payload: IDPayload): Promise<Member>;

  /**
   * Deletes a member from a group.
   * @param clientId - ID of the user making the deletion request
   * @param userId - ID of the member to be deleted
   * @param groupId - ID of the group the member is being removed from
   * @returns Promise resolving to void
   */
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>;

  /**
   * Retrieves members of a group.
   * @param groupId - ID of the group to get members from
   * @param payload - Pagination parameters for the query
   * @returns Promise resolving to an array of SearchedUser objects
   */
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]>;

  /**
   * Toggles notification settings for a member in a group.
   * @param payload - Object containing notification configuration settings
   * @returns Promise resolving to the updated Member object
   */
  toggleNotification(payload: NotificationConfigPayload): Promise<Member>;

  /**
   * Retrieves posts made by members of a group.
   * @param payload - Pagination parameters for the query
   * @param viewer - ID of the user viewing the posts
   * @param groupId - ID of the group to get posts from
   * @returns Promise resolving to an array of PostWithMediaURL objects
   */
  getMemberPosts(payload: Pagination, viewer: string, groupId: string): Promise<PostWithMediaURL[]>;
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;
  private mediaService: MediaService;

  constructor(memberTransaction: MemberTransaction, mediaService: MediaService) {
    this.memberTransaction = memberTransaction;
    this.mediaService = mediaService;
  }

  async getMember(payload: IDPayload): Promise<Member> {
    const getMemberImpl = async () => {
      const member = await this.memberTransaction.getMember(payload);
      if (!member) {
        throw new NotFoundError("Group");
      }
      return member;
    };
    return handleServiceError(getMemberImpl)();
  }

  async addMember(payload: AddMemberPayload): Promise<Member> {
    const addMemberImpl = async () => {
      const member = await this.memberTransaction.insertMember({ ...payload });
      if (!member) {
        throw new InternalServerError("Failed to add member");
      }
      return member;
    };
    return handleServiceError(addMemberImpl)();
  }

  async deleteMember(clientId: string, userId: string, groupId: string): Promise<void> {
    const deleteMemberImpl = async () => {
      await this.memberTransaction.deleteMember(clientId, userId, groupId);
    };
    return handleServiceError(deleteMemberImpl)();
  }

  async getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]> {
    const getMembersImpl = async () => {
      const members = await this.memberTransaction.getMembers(groupId, payload);
      if (!members) {
        throw new NotFoundError("Group");
      }
      const profileURLs = await this.mediaService.getUsersWithSignedURL(members);
      return profileURLs;
    };
    return handleServiceError(getMembersImpl)();
  }

  async getMemberPosts(
    payload: Pagination,
    viewer: string,
    groupId: string,
  ): Promise<PostWithMediaURL[]> {
    const getMemberPostsImpl = async () => {
      const posts = await this.memberTransaction.getMemberPosts(payload, viewer, groupId);
      const postsWithUrls = await Promise.all(
        posts.map(this.mediaService.getPostWithMediaUrls.bind(this.mediaService)),
      );
      return postsWithUrls;
    };
    return handleServiceError(getMemberPostsImpl)();
  }

  async toggleNotification(payload: NotificationConfigPayload): Promise<Member> {
    const toggleNotificationImpl = async () => {
      return await this.memberTransaction.toggleNotification(payload);
    };
    return handleServiceError(toggleNotificationImpl)();
  }
}
