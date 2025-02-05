import { z } from "zod";
import { validate } from "uuid";

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

export type NotificationMetadata = {
  deviceTokens: string[];
  groupId: string;
  groupName: string;
};

export type NudgeTarget = {
  userId: string;
  deviceToken: string;
};
