import { z } from "zod";

export const CREATE_POST_SCHEMA = z.object({
  caption: z
    .string()
    .max(500, {
      message: "Caption must be at most 500 characters",
    })
    .optional(),
  photos: z
    .string()
    .array()
    .min(1, {
      message: "Please select at least 1 photo",
    })
    .max(3, {
      message: "Maximum photos added",
    }),
  location: z
    .string()
    .max(100, {
      message: "Location must be at most 100 characters long",
    })
    .optional(),
  group: z.string({
    required_error: "Group is required",
  }),
});
