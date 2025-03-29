import { z } from "zod";
import { MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

export const processURLValidate = z
  .object({
    url: z
      .string()
  })
