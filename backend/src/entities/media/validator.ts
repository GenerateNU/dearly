import { z } from "zod";

export const processURLValidate = z
  .object({
    url: z
      .string()
  })
