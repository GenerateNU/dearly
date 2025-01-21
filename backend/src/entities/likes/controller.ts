import { Context } from "hono";
import { LikeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { Status } from "../../constants/http";
import { LIKE_USERS, TOGGLE_LIKE } from "../../types/api/routes/posts";
import { paginationSchema } from "../../utilities/pagination";

export interface LikeController {
  toggleLike(ctx: Context): Promise<TOGGLE_LIKE>;
  getLikeUsers(ctx: Context): Promise<LIKE_USERS>;
}

export class LikeControllerImpl implements LikeController {
  private likeService: LikeService;

  constructor(likeService: LikeService) {
    this.likeService = likeService;
  }

  async toggleLike(ctx: Context): Promise<TOGGLE_LIKE> {
    const toggleLikeImpl = async () => {
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const isLiking = await this.likeService.toggleLike({ id: postId, userId });
      const action = isLiking ? "like" : "unlike";
      return ctx.json({ message: `Successfully ${action} post` }, Status.OK);
    };
    return await handleAppError(toggleLikeImpl)(ctx);
  }

  async getLikeUsers(ctx: Context): Promise<LIKE_USERS> {
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
