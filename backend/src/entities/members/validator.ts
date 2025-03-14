import { z } from "zod";

export const notificationValidate = z
  .object({
    likeNotificationEnabled: z.boolean().optional(),
    commnentNotificationEnabled: z.boolean().optional(),
    nudgeNotificationEnabled: z.boolean().optional(),
    postNotificationEnabled: z.boolean().optional(),
  })
  .passthrough();
