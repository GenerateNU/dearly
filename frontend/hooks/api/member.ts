import { Member, NotificationConfigPayload } from "@/types/group";
import { useMutationBase, useQueryBase } from "./base";
import { configNotification, getMember, removeMember } from "@/api/member";
import { manualNudge } from "@/api/nudge";

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

/**
 * Hook to remove a member from group
 *
 * @param groupId The ID of the group
 * @returns Mutation object for removing a member from a group
 */
export const useRemoveMember = (groupId: string) => {
  return useMutationBase<string, void>(
    (userId) => removeMember(groupId, userId),
    ["groups", groupId, "members"],
  );
};

/**
 * Hook to nudge a member in a group
 *
 * @param groupId The ID of the group
 * @returns Mutation object for nudging a member from a group
 */
export const useManualNudge = (groupId: string) => {
  return useMutationBase<string[], void>(
    (userId) => manualNudge(groupId, userId),
    ["groups", groupId, "members"],
  );
};
