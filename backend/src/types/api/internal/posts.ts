import { z } from "zod";
import { createPostValidate, updatePostValidate } from "../../../entities/posts/validator";
import { mediaTable, postsTable } from "../../../entities/schema";
import { IDPayload } from "../../id";

export type CreatePostPayload = z.infer<typeof createPostValidate> & {
  groupId: string;
  userId: string;
};

export type UpdatePostPayload = z.infer<typeof updatePostValidate> & IDPayload;

export type Media = typeof mediaTable.$inferSelect;
type Post = typeof postsTable.$inferSelect;

export type PostWithMedia = Post & {
  media: Media[];
};

export type MediaWithURL = {
  id: string;
  url: string;
  postId: string;
  type: "VIDEO" | "PHOTO";
};

export type PostWithMediaURL = Post & {
  media: MediaWithURL[];
};
