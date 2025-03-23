import {
  Comment,
  CommentPagination,
  CommentWithMetadata,
  CreateCommentPayload,
} from "../../types/api/internal/comments";
import { IDPayload } from "../../types/api/internal/id";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { CommentTransaction } from "./transaction";

/**
 * Interface defining the operations related to comment services such as liking comment, creating, deleting, and fetching comments.
 * The methods in this interface interact with a database or storage mechanism to perform the required actions.
 */
export interface CommentService {
  /**
   * Toggles the like status of a comment.
   *
   * @param payload - An object containing the ID of the comment and commenter ID to toggle the like status.
   * @returns A boolean indicating whether the comment is now liked (true) or unliked (false).
   */
  toggleLikeComment(payload: IDPayload): Promise<boolean>;

  /**
   * Creates a new comment.
   *
   * @param payload - An object containing the necessary data to create a new comment.
   * @returns The created comment object.
   */
  createComment(payload: CreateCommentPayload): Promise<Comment>;

  /**
   * Deletes a comment by its ID given comment id and user id.
   *
   * @param payload - An object containing the user ID of commenter and ID of the comment to be deleted.
   * @returns A void response, confirming the deletion of the comment.
   */
  deleteComment(payload: IDPayload): Promise<void>;

  /**
   * Retrieves a list of comments with pagination.
   *
   * @param payload - An object containing pagination details (e.g., page number, limit, post ID, user ID).
   * @returns A list of comments with metadata (such as signed URLs for media files).
   */
  getComments(payload: CommentPagination): Promise<CommentWithMetadata[]>;
}

export class CommentServiceImpl implements CommentService {
  private commentTransaction: CommentTransaction;
  private mediaService: MediaService;

  constructor(commentTransaction: CommentTransaction, mediaService: MediaService) {
    this.commentTransaction = commentTransaction;
    this.mediaService = mediaService;
  }

  async toggleLikeComment(payload: IDPayload): Promise<boolean> {
    const toggleLikeCommentImpl = async () => {
      return await this.commentTransaction.toggleLikeComment(payload);
    };
    return await handleServiceError(toggleLikeCommentImpl)();
  }

  async createComment(payload: CreateCommentPayload): Promise<Comment> {
    const createCommentImpl = async () => {
      return await this.commentTransaction.createComment(payload);
    };
    return await handleServiceError(createCommentImpl)();
  }

  async getComments(payload: CommentPagination): Promise<CommentWithMetadata[]> {
    const getCommentsImpl = async () => {
      const comments = await this.commentTransaction.getComments(payload);
      const commentsWithURL = await Promise.all(
        comments.map(async (comment) => ({
          ...comment,
          voiceMemo: comment.voiceMemo
            ? await this.mediaService.getSignedUrl(comment.voiceMemo)
            : null,
          profilePhoto: comment.profilePhoto
            ? await this.mediaService.getSignedUrl(comment.profilePhoto)
            : null,
        })),
      );
      return commentsWithURL;
    };
    return await handleServiceError(getCommentsImpl)();
  }

  async deleteComment(payload: IDPayload): Promise<void> {
    const deleteCommentsImpl = async () => {
      return await this.commentTransaction.deleteComment(payload);
    };
    return await handleServiceError(deleteCommentsImpl)();
  }
}
