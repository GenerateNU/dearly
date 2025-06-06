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

export const GROUP_SCHEMA = z.object({
  name: z.string().min(1, { message: "Group name is required" }),
});

export type GroupFormData = z.infer<typeof GROUP_SCHEMA>;
export const UPDATE_USER_FORM = z.object({
  name: z.string().max(100, {
    message: "Username must be less than 100 characters",
  }),
});

export const UPDATE_USERNAME_FORM = z.object({
  username: z.string().max(100, {
    message: "Caption must be at most 100 characters",
  }),
});

export const UPDATE_BIO_FORM = z.object({
  bio: z.string().max(100, {
    message: "Bio cannot exceed 100 characters",
  }),
});

export const UPDATE_BIRTHDAY_FORM = z.object({
  birthday: z.date(),
});

export const UPDATE_PHOTO_FORM = z.object({
  profilePhoto: z.string(),
});
