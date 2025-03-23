import { Context } from "hono";
import { CommentService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import {
  PatchCommentResponse,
  CreateCommentResponse,
  GetCommentResponse,
  DeleteCommentResponse,
} from "../../types/api/routes/comment";
import { createCommentValidate } from "./validator";
import { CreateCommentPayload } from "../../types/api/internal/comments";
import { paginationSchema } from "../../utilities/pagination";

export interface CommentController {
  toggleLikeComment(ctx: Context): Promise<PatchCommentResponse>;
  createComment(ctx: Context): Promise<CreateCommentResponse>;
  deleteComment(ctx: Context): Promise<DeleteCommentResponse>;
  getComments(ctx: Context): Promise<GetCommentResponse>;
}

export class CommentControllerImpl implements CommentController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  async toggleLikeComment(ctx: Context): Promise<PatchCommentResponse> {
    const toggleLikeCommentImpl = async () => {
      const userId = ctx.get("userId");
      const id = parseUUID(ctx.req.param("id"));
      const isLiked = await this.commentService.toggleLikeComment({ id, userId });
      const message = isLiked ? "like" : "unlike";
      return ctx.json({ message: `Successfully ${message} comment` }, 200);
    };
    return await handleAppError(toggleLikeCommentImpl)(ctx);
  }

  async createComment(ctx: Context): Promise<CreateCommentResponse> {
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

  async deleteComment(ctx: Context): Promise<DeleteCommentResponse> {
    const deleteCommentImpl = async () => {
      const userId = ctx.get("userId");
      const id = parseUUID(ctx.req.param("id"));
      await this.commentService.deleteComment({ userId, id });
      return ctx.json({ message: `Successfully deleted comment` }, 200);
    };
    return await handleAppError(deleteCommentImpl)(ctx);
  }

  async getComments(ctx: Context): Promise<GetCommentResponse> {
    const getCommentImpl = async () => {
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const { limit, page } = ctx.req.query();
      const pagination = paginationSchema.parse({ limit, page });
      const comments = await this.commentService.getComments({
        userId,
        postId,
        limit: pagination.limit,
        page: pagination.page,
      });
      return ctx.json(comments, 200);
    };
    return await handleAppError(getCommentImpl)(ctx);
  }
}
