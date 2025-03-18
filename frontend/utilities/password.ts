import { z } from "zod";

export const PASSWORD_SCHEMA = z.object({
  password: z
    .string()
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    })
    .min(8, { message: "Password must be at least 8 characters long" }),
  retypedPassword: z.string(),
});
