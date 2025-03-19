import { NotificationConfigPayload } from "../../types/api/internal/notification";
import { AddMemberPayload, GroupMember, Member } from "../../types/api/internal/members";
import { PostWithMediaURL } from "../../types/api/internal/posts";
import { Pagination, SearchedUser } from "../../types/api/internal/users";
import { IDPayload } from "../../types/id";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { MemberTransaction } from "./transaction";

export interface MemberService {
  addMember(payload: AddMemberPayload): Promise<Member>;
  getMember(payload: IDPayload): Promise<Member>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]>;
  toggleNotification(payload: NotificationConfigPayload): Promise<Member>;
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

  async getMembers(groupId: string, payload: Pagination): Promise<GroupMember[]> {
    const getMembersImpl = async () => {
      const members = await this.memberTransaction.getMembers(groupId, payload);
      if (!members) {
        throw new NotFoundError("Group");
      }
      const profileURLs = await this.mediaService.getUsersWithSignedURL(members);

      const membersWithProfileURLs = members.map((member, index) => {
        return {
          ...member,
          profilePhoto: profileURLs[index] ? profileURLs[index].profilePhoto : null,
        };
      });
      return membersWithProfileURLs;
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
