import { z } from "zod";
import { createPostValidate, updatePostValidate } from "../../../entities/posts/validator";
import { postsTable } from "../../../entities/schema";
import { IDPayload } from "../../id";
import { Media, MediaWithURL } from "./media";

export type CreatePostPayload = z.infer<typeof createPostValidate> & {
  groupId: string;
  userId: string;
};

export type UpdatePostPayload = z.infer<typeof updatePostValidate> & IDPayload;

export type Post = typeof postsTable.$inferSelect;

export type PostWithMedia = Post &
  PostMetadata & {
    media: Media[];
  };

export type PostWithMediaURL = Post &
  PostMetadata & {
    media: MediaWithURL[];
  };

export type PostMetadata = {
  likes: number;
  comments: number;
  isLiked: boolean;
  profilePhoto: string | null;
};

export { Media };
