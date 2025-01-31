import { AddMemberPayload, Member } from "../../types/api/internal/members";
import { Pagination, SearchedUser } from "../../types/api/internal/users";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { MemberTransaction } from "./transaction";

export interface MemberService {
  addMember(payload: AddMemberPayload): Promise<Member>;
  deleteMember(clientId: string, userId: string, groupId: string): Promise<void>;
  getMembers(groupId: string, payload: Pagination): Promise<SearchedUser[]>;
}

export class MemberServiceImpl implements MemberService {
  private memberTransaction: MemberTransaction;
  private mediaService: MediaService;

  constructor(memberTransaction: MemberTransaction, mediaService: MediaService) {
    this.memberTransaction = memberTransaction;
    this.mediaService = mediaService;
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
      const membersWithProfileURLs = await this.mediaService.getUsersWithSignedURL(members);
      return membersWithProfileURLs;
    };
    return handleServiceError(getMembersImpl)();
  }
}
