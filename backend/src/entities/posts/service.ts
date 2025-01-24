import { CreatePostPayload, PostWithMedia, UpdatePostPayload } from "./validator";
import { PostTransaction } from "./transaction";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { IDPayload } from "../../types/id";
import S3Impl from "../../services/s3Service";

export interface PostService {
  createPost(payload: CreatePostPayload): Promise<PostWithMedia>;
  getPost(payload: IDPayload): Promise<PostWithMedia>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia>;
  deletePost(payload: IDPayload): Promise<void>;
}

export class PostServiceImpl implements PostService {
  private postTransaction: PostTransaction;
  private s3ServiceProvider: S3Impl;
  
  constructor(postTransaction: PostTransaction, s3ServiceProvider: S3Impl) {
    this.postTransaction = postTransaction;
    this.s3ServiceProvider = s3ServiceProvider;
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
}
