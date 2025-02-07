import { Context } from "hono";
import { CommentService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import {
  COMMENT_API,
  CREATE_COMMENT_API,
  DELETE_COMMENT_API,
  GET_COMMENT_API,
} from "../../types/api/routes/comment";
import { createCommentValidate } from "./validator";
import { CreateCommentPayload } from "../../types/api/internal/comments";

export interface CommentController {
  toggleLikeComment(ctx: Context): Promise<COMMENT_API>;
  createComment(ctx: Context): Promise<CREATE_COMMENT_API>;
  deleteComment(ctx: Context): Promise<DELETE_COMMENT_API>;
  getComments(ctx: Context): Promise<GET_COMMENT_API>;
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

  async createComment(ctx: Context): Promise<CREATE_COMMENT_API> {
    const createCommentImpl = async () => {
      const userId = ctx.get("userId");
      const postId = parseUUID(ctx.req.param("id"));

      const commentPayload = createCommentValidate.parse(await ctx.req.json());
      const createCommentPayload: CreateCommentPayload = {
        postId,
        userId,
        ...commentPayload,
      };
      const comment = await this.commentService.createComment(createCommentPayload);
      return ctx.json(comment, 201);
    };
    return await handleAppError(createCommentImpl)(ctx);
  }

  async deleteComment(ctx: Context): Promise<CREATE_COMMENT_API> {
    const deleteCommentImpl = async () => {
      const userId = ctx.get("userId");
      const id = parseUUID(ctx.req.param("id"));
      await this.commentService.deleteComment({ userId, id });
      return ctx.json({ message: `Successfully deleted comment` }, 200);
    };
    return await handleAppError(deleteCommentImpl)(ctx);
  }

  async getComments(ctx: Context): Promise<GET_COMMENT_API> {
    const getCommentImpl = async () => {
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const { limit, page } = ctx.req.query();
      const numLimit = Number(limit);
      const numPage = Number(page);
      const comments = await this.commentService.getComments({
        userId,
        postId,
        limit: numLimit,
        page: numPage,
      });
      return ctx.json(comments, 200);
    };
    return await handleAppError(getCommentImpl)(ctx);
  }
}
