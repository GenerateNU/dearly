import { z } from "zod";
import { MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";
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
      .refine((media) => media.length > 0, {
        message: "At least one media item (PHOTO or VIDEO) is required.",
      }),
  })
  .passthrough();

export const updatePostValidate = createPostValidate.partial();

export type Media = typeof mediaTable.$inferSelect;
type Post = typeof postsTable.$inferSelect;

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

export type PostWithMedia = Post & {
  media: Media[];
};
