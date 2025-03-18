import { Group, InvitationToken } from "@/types/group";
import { useMutationBase, useQueryBase } from "./base";
import { createGroup, getGroup } from "@/api/group";
import { getInviteToken } from "@/api/invite";

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

/**
 * Hook to create a new group
 *
 * @returns Mutation object for creating a group
 */
export const useCreateGroup = () => {
  return useMutationBase<CreateGroupPayload, Group>(createGroup, ["users", "groups"]);
};

/**
 * Hook to get a group by ID
 *
 * @param id - The ID of the group to fetch
 * @param options - Additional options for the query
 * @returns Query result containing the group data
 */
export const useGetGroup = (id: string, options: any = {}) => {
  return useQueryBase<Group>(["groups", id], () => getGroup(id), {
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to get a group's invite token
 *
 * @param id - The ID of the group to fetch
 * @param options - Additional options for the query
 * @returns Query result containing the group data
 */
export const useGetInviteToken = (id: string, options: any = {}) => {
  return useQueryBase<InvitationToken>(["groups", id, "invites"], () => getInviteToken(id), {
    enabled: !!id,
    ...options,
  });
};
