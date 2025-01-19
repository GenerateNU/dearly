import { z } from "zod";
import {
  MAX_MEDIA_COUNT,
  MIN_LIMIT,
  MIN_MEDIA_COUNT,
  TEXT_MAX_LIMIT,
} from "../../constants/database";
import { mediaTable, postsTable } from "../schema";

export const createPostValidate = z
  .object({
    caption: z
      .string()
      .min(MIN_LIMIT, `Caption must be at least ${MIN_LIMIT} character long`)
      .max(TEXT_MAX_LIMIT, `Caption must be at most ${TEXT_MAX_LIMIT} characters long`)
      .optional(),
    media: z
      .array(
        z.object({
          type: z.enum(["VIDEO", "PHOTO"]),
          url: z.string().url(),
        }),
      )
      .min(MIN_MEDIA_COUNT, {
        message: `At least ${MIN_MEDIA_COUNT} media item (PHOTO or VIDEO) is required.`,
      })
      .max(MAX_MEDIA_COUNT, { message: `At most ${MAX_MEDIA_COUNT} media items are allowed.` }),
  })
  .passthrough();

export const updatePostValidate = createPostValidate.partial();

export type CreatePostPayload = z.infer<typeof createPostValidate> & {
  groupId: string;
  userId: string;
};

export type UpdatePostPayload = z.infer<typeof updatePostValidate> & IDPayload;

export type IDPayload = {
  userId: string;
  id: string;
  groupId: string;
};

type Media = typeof mediaTable.$inferSelect;
type Post = typeof postsTable.$inferSelect;

export type PostWithMedia = Post & {
  media: Media[];
};
