import {
  Group,
  GroupCalendar,
  GroupMember,
  InvitationToken,
  UpdateGroupPayload,
} from "@/types/group";
import { useMutationBase, useQueryBase, useQueryPagination } from "./base";
import { createGroup, deleteGroup, getGroup, getGroupCalendar, updateGroup } from "@/api/group";
import { getInviteToken, verifyInviteToken } from "@/api/invite";
import { getAllMembers } from "@/api/member";
import { useInfiniteQuery } from "@tanstack/react-query";

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
 * Hook to update a group
 *
 * @returns Mutation object for updating a group
 */
export const useUpdateGroup = (id: string) => {
  return useMutationBase<UpdateGroupPayload, Group>(
    (payload) => updateGroup(id, payload),
    ["users", "groups"],
  );
};

/**
 * Hook to delete a group
 *
 * @returns Mutation object for deleting a group
 */
export const useDeleteGroup = (
  onSuccess?: (data: any) => void,
  onError?: (error: unknown) => void,
) => {
  return useMutationBase(
    (groupId: string) => deleteGroup(groupId),
    ["users", "groups"],
    onSuccess,
    onError,
  );
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

/**
 * Hook to get group's calendar in a date range
 *
 * @param id - Group ID
 * @param pivot - Starting date to fetch from (as Date object)
 * @param range - Number of months to fetch (negative for past months)
 * @param options - Additional options for the query
 * @returns Query result containing the group calendar data
 */
/**
 * Hook to get group's calendar with endless scroll
 */
export const useGroupCalendar = (id: string, pivot: Date, range: number, options: any = {}) => {
  const formatDateToMonthYear = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  return useInfiniteQuery<GroupCalendar, Error>({
    queryKey: ["groups", id, "calendar"],
    queryFn: async ({ pageParam }) => {
      const currentPivot = pageParam as Date;
      const formattedDate = formatDateToMonthYear(currentPivot);
      return getGroupCalendar(id, formattedDate, range);
    },
    initialPageParam: pivot,
    getNextPageParam: (_, __, lastPageParam) => {
      const nextPivot = new Date(lastPageParam as Date);
      nextPivot.setMonth(nextPivot.getMonth() - Math.abs(range));
      return nextPivot;
    },
    ...options,
  });
};
