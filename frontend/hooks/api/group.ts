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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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
 * @param direction - Direction of getting data (before pivot or after pivot)
 * @param options - Additional options for the query
 * @returns Query result containing the group calendar data
 */
export const useGroupCalendar = (
  id: string,
  initialPivot: Date,
  range: number,
  options: any = {},
) => {
  const formatDateToMonthYear = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}`;
  };

  // Query for previous months (backward direction)
  const previousMonthsQuery = useInfiniteQuery<GroupCalendar, Error>({
    queryKey: ["groups", id, "calendar", "previous"],
    queryFn: async ({ pageParam }) => {
      const currentPivot = pageParam as Date;
      const formattedDate = formatDateToMonthYear(currentPivot);
      // Pass 'before' direction to the API
      return getGroupCalendar(id, formattedDate, range, "before");
    },
    initialPageParam: initialPivot,
    getNextPageParam: (_, __, lastPageParam) => {
      const nextPivot = new Date(lastPageParam as Date);
      nextPivot.setMonth(nextPivot.getMonth() - range);
      return nextPivot;
    },
    ...options,
  });

  // Query for future months (forward direction)
  const futureMonthsQuery = useInfiniteQuery<GroupCalendar, Error>({
    queryKey: ["groups", id, "calendar", "future"],
    queryFn: async ({ pageParam }) => {
      const currentPivot = pageParam as Date;
      const formattedDate = formatDateToMonthYear(currentPivot);
      // Pass 'after' direction to the API
      return getGroupCalendar(id, formattedDate, range, "after");
    },
    initialPageParam: initialPivot,
    getNextPageParam: (_, __, lastPageParam) => {
      const nextPivot = new Date(lastPageParam as Date);
      nextPivot.setMonth(nextPivot.getMonth() + range);
      const now = new Date();
      if (nextPivot > now) {
        return undefined;
      }
      return nextPivot;
    },
    ...options,
  });

  // Initial "both" direction query for the pivot itself
  const pivotMonthQuery = useQuery<GroupCalendar, Error>({
    queryKey: ["groups", id, "calendar", "pivot"],
    queryFn: async () => {
      const formattedDate = formatDateToMonthYear(initialPivot);
      return getGroupCalendar(id, formattedDate, 1, "both");
    },
    ...options,
  });

  // Combine data from all queries
  const allMonths = useMemo(() => {
    const months = new Map();

    // Add pivot month data
    if (pivotMonthQuery.data) {
      pivotMonthQuery.data.forEach((month) => {
        const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
        months.set(key, month);
      });
    }

    // Add previous months data
    if (previousMonthsQuery.data) {
      previousMonthsQuery.data.pages.forEach((page) => {
        page.forEach((month) => {
          const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
          months.set(key, month);
        });
      });
    }

    // Add future months data
    if (futureMonthsQuery.data) {
      futureMonthsQuery.data.pages.forEach((page) => {
        page.forEach((month) => {
          const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
          months.set(key, month);
        });
      });
    }

    // Convert map to array and sort by date (newest to oldest)
    return Array.from(months.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  }, [pivotMonthQuery.data, previousMonthsQuery.data, futureMonthsQuery.data]);

  // Combine loading states
  const isLoading =
    pivotMonthQuery.isLoading || previousMonthsQuery.isLoading || futureMonthsQuery.isLoading;

  // Combine error states
  const error = pivotMonthQuery.error || previousMonthsQuery.error || futureMonthsQuery.error;

  // Combine refetching states
  const isRefetching =
    pivotMonthQuery.isRefetching ||
    previousMonthsQuery.isRefetching ||
    futureMonthsQuery.isRefetching;

  // Functions to fetch more data in either direction
  const fetchPreviousMonths = () => {
    if (!previousMonthsQuery.isFetchingNextPage) {
      previousMonthsQuery.fetchNextPage();
    }
  };

  const fetchFutureMonths = () => {
    if (!futureMonthsQuery.isFetchingNextPage) {
      futureMonthsQuery.fetchNextPage();
    }
  };

  return {
    data: allMonths,
    isLoading,
    error,
    isRefetching,
    isFetchingPrevious: previousMonthsQuery.isFetchingNextPage,
    isFetchingFuture: futureMonthsQuery.isFetchingNextPage,
    fetchPreviousMonths,
    fetchFutureMonths,
    hasMorePrevious: previousMonthsQuery.hasNextPage,
    hasMoreFuture: futureMonthsQuery.hasNextPage,
  };
};
