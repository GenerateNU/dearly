import { IDPayload } from "../../types/id";
import { handleServiceError } from "../../utilities/errors/service-error";
import { MediaService } from "../media/service";
import { CommentTransaction } from "./transaction";

export interface CommentService {
  toggleLikeComment(payload: IDPayload): Promise<boolean>;
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
}
