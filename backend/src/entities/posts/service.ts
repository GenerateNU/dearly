import { PostTransaction } from "./transaction";
import { InternalServerError, NotFoundError } from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { IDPayload } from "../../types/api/internal/id";
import {
  CreatePostPayload,
  PostWithMedia,
  PostWithMediaURL,
  UpdatePostPayload,
} from "../../types/api/internal/posts";
import { MediaService } from "../media/service";

/**
 * Interface for handling post-related service operations.
 * Provides methods for creating, retrieving, updating, and deleting posts.
 */
export interface PostService {
  /**
   * Creates a new post.
   * @param payload - The payload containing post data and media
   * @returns Promise resolving to the created post
   * @throws InternalServerError if post creation fails
   */
  createPost(payload: CreatePostPayload): Promise<PostWithMedia>;

  /**
   * Retrieves a post by its ID.
   * @param payload - The ID payload containing post ID and user ID
   * @returns Promise resolving to the post with media URLs
   * @throws NotFoundError if post does not exist
   */
  getPost(payload: IDPayload): Promise<PostWithMediaURL>;

  /**
   * Updates an existing post.
   * @param payload - The payload containing updated post data
   * @returns Promise resolving to the updated post
   * @throws NotFoundError if post does not exist
   */
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia>;

  /**
   * Deletes a post.
   * @param payload - The ID payload containing post ID and user ID
   * @returns Promise resolving to void
   * @throws NotFoundError if post does not exist
   */
  deletePost(payload: IDPayload): Promise<void>;
}

export class PostServiceImpl implements PostService {
  private postTransaction: PostTransaction;
  private mediaService: MediaService;

  constructor(postTransaction: PostTransaction, mediaService: MediaService) {
    this.postTransaction = postTransaction;
    this.mediaService = mediaService;
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

  async getPost(payload: IDPayload): Promise<PostWithMediaURL> {
    const getPostImpl = async () => {
      const post = await this.postTransaction.getPost(payload);
      if (!post) {
        throw new NotFoundError("Post");
      }
      const postWithMediaUrls = await this.mediaService.getPostWithMediaUrls(post);
      return postWithMediaUrls;
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
