import { Group, GroupMember, InvitationToken } from "@/types/group";
import { useMutationBase, useQueryBase, useQueryPagination } from "./base";
import { createGroup, getGroup } from "@/api/group";
import { getInviteToken, verifyInviteToken } from "@/api/invite";
import { getAllMembers } from "@/api/member";

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
 * Hook to verify invite token and add user to group
 *
 * @returns Mutation object for verifying invite token
 */
export const useVerifyInviteToken = () => {
  return useMutationBase<string, void>((token) => verifyInviteToken(token), ["users", "groups"]);
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

/**
 * Hook to get all group members
 *
 * @param options - Additional options for the query
 * @returns Query result containing the group members
 */
export const useGroupMembers = (id: string, options: any = {}) => {
  const wrappedQuery = (limit: number, page: number) => {
    return getAllMembers(id, limit, page);
  };
  return useQueryPagination<GroupMember[]>(["groups", id, "members"], wrappedQuery, options, 10);
};
