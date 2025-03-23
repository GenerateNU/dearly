import { LikeTransaction } from "./transaction";
import { handleServiceError } from "../../utilities/errors/service-error";
import { PaginationParams } from "../../utilities/api/pagination";
import { IDPayload } from "../../types/api/internal/id";
import { SearchedUser } from "../../types/api/internal/users";
import { MediaService } from "../media/service";

/**
 * Interface defining the operations related to likes on posts, including toggling likes and fetching users who liked a post.
 */
export interface LikeService {
  /**
   * Toggles the like status for a specific post by a user.
   * If the user has already liked the post, it will remove the like; otherwise, it will add the like.
   *
   * @param payload - An object containing the `id` (post ID) of the post and `userId` of the user performing the action.
   * @returns A boolean indicating whether the like was successfully added or removed (true for adding, false for removing).
   */
  toggleLike(payload: IDPayload): Promise<boolean>;

  /**
   * Retrieves a list of users who have liked a specific post, with pagination support.
   * The users' profile images are also returned with a signed URL for temporary access.
   *
   * @param payload - An object containing the `id` (post ID), `limit`, and `page` for pagination.
   * @returns An array of `SearchedUser` objects representing the users who liked the post, with profile images URLs.
   */
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
