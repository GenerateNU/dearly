import { LikeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { SearchedUser } from "../users/validator";
import { PaginationParams } from "../../utilities/pagination";
import { IDPayload } from "../../types/id";
import { IS3Operations } from "../../services/s3Service";

export interface LikeService {
  toggleLike(payload: IDPayload): Promise<boolean>;
  getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]>;
}

export class LikeServiceImpl implements LikeService {
  private likeTransaction: LikeTransaction;
  private s3Service: IS3Operations;

  constructor(likeTransaction: LikeTransaction, s3ServiceProvider: IS3Operations) {
    this.likeTransaction = likeTransaction;
    this.s3Service = s3ServiceProvider;
  }

  async toggleLike(payload: IDPayload): Promise<boolean> {
    const toggleLikeImpl = async () => {
      return await this.likeTransaction.toggleLike(payload);
    };
    return await handleServiceError(toggleLikeImpl)();
  }

  async getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]> {
    const getLikeUsersImpl = async () => {
      return await this.likeTransaction.getLikeUsers(payload);
    };
    return await handleServiceError(getLikeUsersImpl)();
  }
}
