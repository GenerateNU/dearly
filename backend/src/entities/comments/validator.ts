import { z } from "zod";
import { MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

export const createCommentValidate = z
  .object({
    content: z
      .string()
      .min(MIN_LIMIT, `Comment must be at least ${MIN_LIMIT} character long`)
      .max(TEXT_MAX_LIMIT, `Comment must be at most ${TEXT_MAX_LIMIT} characters long`)
      .optional(),
    voiceMemo: z.string().uuid().optional(),
  })
  .passthrough()
  .partial()
  .refine(
    (data) => (data.content || data.voiceMemo) && !(data.content && data.voiceMemo),
    "Either content or voiceMemo should be defined",
  );
