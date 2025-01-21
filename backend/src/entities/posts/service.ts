import { CreatePostPayload, PostWithMedia, UpdatePostPayload, IDPayload } from "./validator";
import { PostTransaction } from "./transaction";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { SearchedUser } from "../users/validator";
import { PaginationParams } from "../../utilities/pagination";

export interface PostService {
  createPost(payload: CreatePostPayload): Promise<PostWithMedia>;
  getPost(payload: IDPayload): Promise<PostWithMedia>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia>;
  deletePost(payload: IDPayload): Promise<void>;
  toggleLike(payload: IDPayload): Promise<void>;
  getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]>;
}

export class PostServiceImpl implements PostService {
  private postTransaction: PostTransaction;

  constructor(postTransaction: PostTransaction) {
    this.postTransaction = postTransaction;
  }

  async createPost(payload: CreatePostPayload): Promise<PostWithMedia> {
    const createPostImpl = async () => {
      const post = await this.postTransaction.createPost(payload);
      if (!post) {
        throw new InternalServerError("Failed to create post");
      }
      return post;
    };
    return await handleServiceError(createPostImpl)();
  }

  async getPost(payload: IDPayload): Promise<PostWithMedia> {
    const getPostImpl = async () => {
      const post = await this.postTransaction.getPost(payload);
      if (!post) {
        throw new NotFoundError("Post");
      }
      return post;
    };
    return await handleServiceError(getPostImpl)();
  }

  async updatePost(payload: UpdatePostPayload): Promise<PostWithMedia> {
    const updatePostImpl = async () => {
      const updatedPost = await this.postTransaction.updatePost(payload);
      if (!updatedPost) {
        throw new NotFoundError("Post");
      }
      return updatedPost;
    };
    return await handleServiceError(updatePostImpl)();
  }

  async deletePost(payload: IDPayload): Promise<void> {
    const deletePostImpl = async () => {
      await this.postTransaction.deletePost(payload);
    };
    return await handleServiceError(deletePostImpl)();
  }

  async toggleLike(payload: IDPayload): Promise<void> {
    const toggleLikeImpl = async () => {
      await this.postTransaction.toggleLike(payload);
    };
    return await handleServiceError(toggleLikeImpl)();
  }

  async getLikeUsers(payload: IDPayload & PaginationParams): Promise<SearchedUser[]> {
    const getLikeUsersImpl = async () => {
      return await this.postTransaction.getLikeUsers(payload);
    };
    return await handleServiceError(getLikeUsersImpl)();
  }
}
