import { Context } from "hono";
import { LikeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import { Status } from "../../constants/http";
import { LikeUsersResponse, ToggleLikeResponse } from "../../types/api/routes/posts";
import { paginationSchema } from "../../utilities/api/pagination";

/**
 * Interface defining the operations for managing likes on posts.
 * The methods allow users to toggle likes on posts and retrieve a list of users who liked a post.
 */
export interface LikeController {
  /**
   * Toggles the like status for a specific post by a user.
   * If the user has already liked the post, it will remove the like; otherwise, it will add the like.
   *
   * @param ctx - The request context, which contains information such as the post ID and the user ID.
   * @returns A response indicating whether the like was successfully added or removed.
   */
  toggleLike(ctx: Context): Promise<ToggleLikeResponse>;

  /**
   * Retrieves a list of users who have liked a specific post.
   * The users are paginated based on the provided `limit` and `page` query parameters.
   *
   * @param ctx - The request context, which contains the post ID and pagination details (limit and page).
   * @returns A response containing the list of users who liked the post, with pagination applied.
   */
  getLikeUsers(ctx: Context): Promise<LikeUsersResponse>;
}

export class LikeControllerImpl implements LikeController {
  private likeService: LikeService;

  constructor(likeService: LikeService) {
    this.likeService = likeService;
  }

  async toggleLike(ctx: Context): Promise<ToggleLikeResponse> {
    const toggleLikeImpl = async () => {
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const isLiking = await this.likeService.toggleLike({ id: postId, userId });
      const action = isLiking ? "like" : "unlike";
      return ctx.json({ message: `Successfully ${action} post` }, Status.OK);
    };
    return await handleAppError(toggleLikeImpl)(ctx);
  }

  async getLikeUsers(ctx: Context): Promise<LikeUsersResponse> {
    const getLikeUsersImpl = async () => {
      const { limit, page } = ctx.req.query();
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const pagination = paginationSchema.parse({ limit, page });
      const users = await this.likeService.getLikeUsers({ id: postId, userId, ...pagination });
      return ctx.json(users, Status.OK);
    };
    return await handleAppError(getLikeUsersImpl)(ctx);
  }
}
