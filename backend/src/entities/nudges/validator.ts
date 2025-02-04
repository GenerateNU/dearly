import { z } from "zod";
import { validate } from "uuid";

export const userIDValidate = z.object({
  users: z.array(
    z.string().refine((token) => !validate(token), {
      message: "Invalid User IDs",
    }),
  ),
});

export type UserIDsPayload = z.infer<typeof userIDValidate>;
