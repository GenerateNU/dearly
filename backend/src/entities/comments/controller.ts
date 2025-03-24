import { Context } from "hono";
import { CommentService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import {
  PatchCommentResponse,
  CreateCommentResponse,
  GetCommentResponse,
  DeleteCommentResponse,
} from "../../types/api/routes/comment";
import { CreateCommentPayload, createCommentValidate } from "../../types/api/internal/comments";
import { paginationSchema } from "../../utilities/api/pagination";

/**
 * Interface defining the methods for interacting with comments.
 * These methods allow toggling likes of comments, creating, deleting, and retrieving comments.
 * Implementations of this interface handle the logic for these operations and manage interactions with the comment service.
 */
export interface CommentController {
  /**
   * Toggles the like status of a comment (like/unlike).
   *
   * @param ctx - The request context containing the necessary parameters and user details.
   * @returns A response indicating the result of the like/unlike action.
   */
  toggleLikeComment(ctx: Context): Promise<PatchCommentResponse>;

  /**
   * Creates a new comment for a specific post.
   *
   * @param ctx - The request context containing the data for the comment and user details.
   * @returns A response containing the created comment and an HTTP status of 201.
   */
  createComment(ctx: Context): Promise<CreateCommentResponse>;

  /**
   * Deletes a specific comment.
   *
   * @param ctx - The request context containing the necessary parameters (comment ID) and user details.
   * @returns A response confirming the successful deletion of the comment.
   */
  deleteComment(ctx: Context): Promise<DeleteCommentResponse>;

  /**
   * Retrieves a list of comments for a specific post with pagination.
   *
   * @param ctx - The request context containing the post ID, pagination details, and user details.
   * @returns A response containing the comments for the post.
   */
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
