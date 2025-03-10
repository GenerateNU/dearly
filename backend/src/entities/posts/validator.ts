import { z } from "zod";
import {
  MAX_MEDIA_COUNT,
  MIN_MEDIA_COUNT,
  NAME_MAX_LIMIT,
  TEXT_MAX_LIMIT,
} from "../../constants/database";

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
      .min(MIN_MEDIA_COUNT, {
        message: `At least ${MIN_MEDIA_COUNT} media item (PHOTO or VIDEO) is required.`,
      })
      .max(MAX_MEDIA_COUNT, { message: `At most ${MAX_MEDIA_COUNT} media items are allowed.` }),
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
