import { getNotifications, getUserGroups } from "@/api/user";
import { Notifications } from "@/types/user";
import { useQueryPagination } from "./base";
import { Group } from "@/types/group";

/**
 * Hook to get all user notifications
 *
 * @param options - Additional options for the query
 * @returns Query result containing the notification data
 */
export const useUserNotification = (options: any = {}) => {
  return useQueryPagination<Notifications>(
    ["users", "notifications"],
    getNotifications,
    options,
    10,
  );
};

/**
 * Hook to get all user groups
 *
 * @param options - Additional options for the query
 * @returns Query result containing the group data
 */
export const useUserGroups = (options: any = {}) => {
  return useQueryPagination<Group[]>(["users", "groups"], getUserGroups, options, 5);
};
