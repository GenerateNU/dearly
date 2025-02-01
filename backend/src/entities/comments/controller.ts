import { Context } from "hono";
import { CommentService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { COMMENT_API } from "../../types/api/routes/comment";

export interface CommentController {
  toggleLikeComment(ctx: Context): Promise<COMMENT_API>;
}

export class CommentControllerImpl implements CommentController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  async toggleLikeComment(ctx: Context): Promise<COMMENT_API> {
    const toggleLikeCommentImpl = async () => {
      const userId = ctx.get("userId");
      const id = parseUUID(ctx.req.param("id"));
      const isLiked = await this.commentService.toggleLikeComment({ id, userId });
      const message = isLiked ? "like" : "unlike";
      return ctx.json({ message: `Successfully ${message} comment` }, 200);
    };
    return await handleAppError(toggleLikeCommentImpl)(ctx);
  }
}
