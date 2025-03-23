import { LikeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { PaginationParams } from "../../utilities/api/pagination";
import { IDPayload } from "../../types/api/internal/id";
import { SearchedUser } from "../../types/api/internal/users";
import { MediaService } from "../media/service";

export interface LikeService {
  toggleLike(payload: IDPayload): Promise<boolean>;
  getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]>;
}

export class LikeServiceImpl implements LikeService {
  private likeTransaction: LikeTransaction;
  private mediaService: MediaService;

  constructor(likeTransaction: LikeTransaction, mediaService: MediaService) {
    this.likeTransaction = likeTransaction;
    this.mediaService = mediaService;
  }

  async toggleLike(payload: IDPayload): Promise<boolean> {
    const toggleLikeImpl = async () => {
      return await this.likeTransaction.toggleLike(payload);
    };
    return await handleServiceError(toggleLikeImpl)();
  }

  async getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]> {
    const getLikeUsersImpl = async () => {
      const users = await this.likeTransaction.getLikeUsers(payload);
      const usersWithProfilePresignedURL = await this.mediaService.getUsersWithSignedURL(users);
      return usersWithProfilePresignedURL;
    };
    return await handleServiceError(getLikeUsersImpl)();
  }
}
