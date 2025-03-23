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

export interface CommentService {
  toggleLikeComment(payload: IDPayload): Promise<boolean>;
  createComment(payload: CreateCommentPayload): Promise<Comment>;
  deleteComment(payload: IDPayload): Promise<void>;
  getComments(payload: CommentPagination): Promise<Comment[]>;
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
