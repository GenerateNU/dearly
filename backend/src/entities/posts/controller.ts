import { Context } from "hono";
import { PostService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import {
  CreatePostPayload,
  createPostValidate,
  UpdatePostPayload,
  updatePostValidate,
} from "./validator";
import { Status } from "../../constants/http";
import { DEL_POST, POST_API } from "../../types/api/routes/posts";
import { paginationSchema } from "../../utilities/pagination";

export interface PostController {
  createPost(ctx: Context): Promise<POST_API>;
  getPost(ctx: Context): Promise<POST_API>;
  updatePost(ctx: Context): Promise<POST_API>;
  deletePost(ctx: Context): Promise<DEL_POST>;
  toggleLike(ctx: Context): Promise<Response>;
  getLikeUsers(ctx: Context): Promise<Response>;
}

export class PostControllerImpl implements PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  async createPost(ctx: Context): Promise<POST_API> {
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

  async getPost(ctx: Context): Promise<POST_API> {
    const getPostImpl = async () => {
      // pull out essential IDs
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      const post = await this.postService.getPost({ userId, id });
      return ctx.json(post, Status.OK);
    };
    return await handleAppError(getPostImpl)(ctx);
  }

  async updatePost(ctx: Context): Promise<POST_API> {
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

  async deletePost(ctx: Context): Promise<DEL_POST> {
    const deletePostImpl = async () => {
      // pull out essential IDs
      const id = parseUUID(ctx.req.param("id"));
      const userId = parseUUID(ctx.get("userId"));

      await this.postService.deletePost({ userId, id });
      return ctx.json({ message: "Successfully delete post" }, Status.OK);
    };
    return await handleAppError(deletePostImpl)(ctx);
  }

  async toggleLike(ctx: Context): Promise<Response> {
    const toggleLikeImpl = async () => {
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const isLiking = await this.postService.toggleLike({ id: postId, userId });
      const action = isLiking ? "like" : "unlike";
      return ctx.json({ message: `Successfully ${action} post` }, Status.OK);
    };
    return await handleAppError(toggleLikeImpl)(ctx);
  }

  async getLikeUsers(ctx: Context): Promise<Response> {
    const getLikeUsersImpl = async () => {
      const { limit, page } = ctx.req.query();
      const postId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const pagination = paginationSchema.parse({ limit, page });
      const users = await this.postService.getLikeUsers({ id: postId, userId, ...pagination });
      return ctx.json(users, Status.OK);
    };
    return await handleAppError(getLikeUsersImpl)(ctx);
  }
}
