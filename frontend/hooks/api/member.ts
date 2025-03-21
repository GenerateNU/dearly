import { Member, NotificationConfigPayload } from "@/types/group";
import { useMutationBase, useQueryBase } from "./base";
import { configNotification, getMember } from "@/api/member";

/**
 * Hook to change notification config for group
 *
 * @returns Mutation object for notification config
 */
export const useConfigNotification = (id: string) => {
  return useMutationBase<NotificationConfigPayload, Member>(
    (payload) => configNotification(id, payload),
    ["groups", id, "members", "info"],
  );
};

/**
 * Hook to get member's information in a group
 *
 * @returns Query result of member's information
 */
export const useMemberInfo = (id: string, options: any = {}) => {
  return useQueryBase<Member>(["groups", id, "members", "info"], () => getMember(id), {
    enabled: !!id,
    ...options,
  });
};
