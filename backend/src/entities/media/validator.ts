import { z } from "zod";
import { MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

export const processURLValidate = z
  .object({
    url: z
      .string()
      .url()
      .refine(
        (url) => {
            return url.substring(7, 39) === "dearly.s3.us-east-1.amazonaws.com";
        }
      )
      .or(
        z.string()
        .refine(
          (str) => {
            return str.startsWith('../') || str.startsWith('/');
          },
        )
      )
  })
