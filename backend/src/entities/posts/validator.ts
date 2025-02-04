import { z } from "zod";
import {
  MAX_MEDIA_COUNT,
  MIN_LIMIT,
  MIN_MEDIA_COUNT,
  TEXT_MAX_LIMIT,
} from "../../constants/database";
import { postsTable } from "../schema";
import { createSelectSchema } from "drizzle-zod";

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



export const postValidate = createSelectSchema(postsTable);



export const updatePostValidate = createPostValidate.partial();
