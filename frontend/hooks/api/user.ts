import { getNotifications, getUser, getUserGroups, updateUser } from "@/api/user";
import { Notifications, UpdateUserPayload, User } from "@/types/user";
import { useMutationBase, useQueryBase, useQueryPagination } from "./base";
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

export const useUser = (id: string, options: any = {}) => {
  return useQueryBase<User>(["users", id], () => getUser(id), {
    enabled: !!id,
    ...options,
  });
};

export const usePatchUser = (id: string, options: any = {}) => {
  return useMutationBase<UpdateUserPayload, User>((payload) => updateUser(payload), ["users", id]);
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
 * Hook to update a user
 *
 * @returns Mutation object for updating a user
 */
export const useUpdateUser = (id: string) => {
  return useMutationBase<UpdateUserPayload, User>((payload) => updateUser(payload), ["users", id]);
};

/*
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
