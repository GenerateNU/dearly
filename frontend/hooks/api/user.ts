import { getNotifications, getUserGroups, updateUser } from "@/api/user";
import { Notifications } from "@/types/user";
import { useMutationBase, useQueryPagination } from "./base";
import { Group } from "@/types/group";
import { UploadUserMediaResponse } from "@/types/media";
import { uploadUserMedia } from "@/api/media";

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

export const usePatchUser = (options: any = {}) => {
  return useMutationBase((payload) => updateUser(payload), ["users", "userid"]);
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

/**
 * Hook to upload group media
 *
 * @returns Mutation object for creating a group
 */
export const useUploadUserMedia = (id: string) => {
  return useMutationBase<FormData, UploadUserMediaResponse>(
    (form) => uploadUserMedia(form),
    ["user", id, "media"],
  );
};
