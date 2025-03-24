import { z } from "zod";

export const paginationSchema = z.object({
  limit: z
    .string()
    .transform((val) => {
      const parsed = Number(val);
      return parsed;
    })
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a positive number",
    })
    .optional()
    .default("10"),
  page: z
    .string()
    .transform((val) => {
      const parsed = Number(val);
      return parsed;
    })
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
