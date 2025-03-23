import { Context } from "hono";
import { PostService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import { Status } from "../../constants/http";
import {
  DeletePostResponse,
  GetPostResponse,
  CreatePostResponse,
  UpdatePostResponse,
} from "../../types/api/routes/posts";
import {
  CreatePostPayload,
  createPostValidate,
  UpdatePostPayload,
  updatePostValidate,
} from "../../types/api/internal/posts";

/**
 * Interface for handling post-related controller operations.
 * Provides methods for creating, retrieving, updating, and deleting posts.
 */
export interface PostController {
  /**
   * Creates a new post.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the created post
   */
  createPost(ctx: Context): Promise<CreatePostResponse>;

  /**
   * Retrieves a post by its ID.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the retrieved post
   */
  getPost(ctx: Context): Promise<GetPostResponse>;

  /**
   * Updates an existing post.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the updated post
   */
  updatePost(ctx: Context): Promise<UpdatePostResponse>;

  /**
   * Deletes a post by its ID.
   * @param ctx - The context of the HTTP request
   * @returns Promise resolving to the deleted post
   */
  deletePost(ctx: Context): Promise<DeletePostResponse>;
}

export class PostControllerImpl implements PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  async createPost(ctx: Context): Promise<CreatePostResponse> {
    const createPostImpl = async () => {
      // pull out essential IDs
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      // validate input
      const postInfoPayload = createPostValidate.parse(await ctx.req.json());

      // format input to send to service layer
      const createPostPayload: CreatePostPayload = {
        groupId,
        userId,
        ...postInfoPayload,
      };
      const post = await this.postService.createPost(createPostPayload);
      return ctx.json(post, Status.Created);
    };
    return await handleAppError(createPostImpl)(ctx);
  }

  async getPost(ctx: Context): Promise<GetPostResponse> {
    const getPostImpl = async () => {
      // pull out essential IDs
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      const post = await this.postService.getPost({ userId, id });
      return ctx.json(post, Status.OK);
    };
    return await handleAppError(getPostImpl)(ctx);
  }

  async updatePost(ctx: Context): Promise<UpdatePostResponse> {
    const updatePostImpl = async () => {
      // pull out essential IDs
      const userId = parseUUID(ctx.get("userId"));
      const postId = parseUUID(ctx.req.param("id"));

      // validate update payload
      const postInfoPayload = updatePostValidate.parse(await ctx.req.json());

      // format input to send to service layer
      const updatePostPayload: UpdatePostPayload = {
        userId,
        id: postId,
        ...postInfoPayload,
      };
      const post = await this.postService.updatePost(updatePostPayload);
      return ctx.json(post, Status.OK);
    };
    return await handleAppError(updatePostImpl)(ctx);
  }

  async deletePost(ctx: Context): Promise<DeletePostResponse> {
    const deletePostImpl = async () => {
      // pull out essential IDs
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      await this.postService.deletePost({ userId, id });
      return ctx.json({ message: "Successfully delete post" }, Status.OK);
    };
    return await handleAppError(deletePostImpl)(ctx);
  }
}
