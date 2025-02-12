import { z } from "zod";
import { validate } from "uuid";
import { createInsertSchema } from "drizzle-zod";
import { scheduledNudgesTable } from "../schema";

export const userIDValidate = z
  .object({
    users: z
      .array(
        z.string().refine((token) => validate(token), {
          message: "Invalid User IDs",
        }),
      )
      .min(1, {
        message: "Please select at least one user to nudge",
      }),
  })
  .passthrough();

