import { CreatePostPayload, PostWithMedia, UpdatePostPayload, IDPayload } from "./validator";
import { PostTransaction } from "./transaction";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { handleServiceError } from "../../utilities/errors/service-error";
import { CheckMemberTransaction } from "./role-transaction";

export interface PostService {
  createPost(payload: CreatePostPayload): Promise<PostWithMedia>;
  getPost(payload: IDPayload): Promise<PostWithMedia>;
  updatePost(payload: UpdatePostPayload): Promise<PostWithMedia>;
  deletePost(payload: IDPayload): Promise<void>;
}

interface PostServiceDep {
  postTransaction: PostTransaction;
  checkMemberTransaction: CheckMemberTransaction;
}

export class PostServiceImpl implements PostService {
  private postTransaction: PostTransaction;
  private checkMemberTransaction: CheckMemberTransaction;

  constructor(dep: PostServiceDep) {
    this.postTransaction = dep.postTransaction;
    this.checkMemberTransaction = dep.checkMemberTransaction;
  }

  async createPost(payload: CreatePostPayload): Promise<PostWithMedia> {
    const createPostImpl = async () => {
      await this.checkIsMember(payload.groupId, payload.userId);
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
      await this.checkIsMember(payload.groupId, payload.userId);
      const post = await this.postTransaction.getPost(payload.id);
      if (!post) {
        throw new NotFoundError("Post does not exist.");
      }
      return post;
    };
    return await handleServiceError(getPostImpl)();
  }

  async updatePost(payload: UpdatePostPayload): Promise<PostWithMedia> {
    const createPostImpl = async () => {
      await this.checkIsOwner(payload.id, payload.userId);
      const updatedPost = await this.postTransaction.updatePost(payload);
      if (!updatedPost) {
        throw new NotFoundError("Post does not exist.");
      }
      return updatedPost;
    };
    return await handleServiceError(createPostImpl)();
  }

  async deletePost(payload: IDPayload): Promise<void> {
    const deletePostImpl = async () => {
      await this.checkIsOwner(payload.id, payload.userId);
      await this.postTransaction.deletePost(payload.id);
    };
    return await handleServiceError(deletePostImpl)();
  }

  async checkIsMember(groupId: string, userId: string): Promise<void> {
    if (!(await this.checkMemberTransaction.isMember(groupId, userId))) {
      throw new ForbiddenError("User is not a member of the group");
    }
  }

  async checkIsManager(groupId: string, userId: string): Promise<void> {
    if (!(await this.checkMemberTransaction.isManager(groupId, userId))) {
      throw new ForbiddenError("User is not a manager of the group");
    }
  }

  async checkIsOwner(postId: string, userId: string): Promise<void> {
    const isOwner = await this.postTransaction.isOwner(postId, userId);
    if (!isOwner) {
      throw new ForbiddenError("User can only update their own posts.");
    }
  }
}
