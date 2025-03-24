import { z } from "zod";
import { postsTable } from "../../../entities/schema";
import { IDPayload } from "./id";
import { MediaLimit, NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../../constants/database";
import { Media, MediaWithURL } from "./media";

export const createPostValidate = z
  .object({
    caption: z
      .string()
      .max(TEXT_MAX_LIMIT, `Caption must be at most ${TEXT_MAX_LIMIT} characters long`)
      .optional(),
    location: z
      .string()
      .max(NAME_MAX_LIMIT, `Location must be at most ${NAME_MAX_LIMIT}`)
      .optional(),
    media: z
      .array(
        z.object({
          type: z.enum(["VIDEO", "PHOTO"]),
          objectKey: z.string().min(1, {
            message: "Object key cannot be empty",
          }),
        }),
      )
      .min(MediaLimit.MIN_COUNT, {
        message: `At least ${MediaLimit.MIN_COUNT} media item (PHOTO or VIDEO) is required.`,
      })
      .max(MediaLimit.MAX_COUNT, {
        message: `At most ${MediaLimit.MAX_COUNT} media items are allowed.`,
      }),
  })
  .passthrough();

export const postValidate = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  caption: z.string().nullable(),
  location: z.string().nullable(),
});

export const updatePostValidate = createPostValidate.partial();

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
  name: string | null;
  username: string;
  profilePhoto: string | null;
};
