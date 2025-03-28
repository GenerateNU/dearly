import { ConfigNudgeSchedulePayload, NudgeSchedule } from "@/types/nudge";
import { useMutationBase, useQueryBase } from "./base";
import { configAutoNudgeSchedule, disableNudge, getAutoNudgeSchedule } from "@/api/nudge";

/**
 * Hook to get a nudge config of a group by ID
 *
 * @param id - The ID of the group to fetch
 * @param options - Additional options for the query
 * @returns Query result containing the group nudge config
 */
export const useGroupNudgeConfig = (id: string, options: any = {}) => {
  return useQueryBase<NudgeSchedule>(
    ["groups", id, "nudges", "auto"],
    () => getAutoNudgeSchedule(id),
    {
      enabled: !!id,
      ...options,
    },
  );
};

/**
 * Hook to update group nudge config
 *
 * @returns Mutation object for updating config
 */
export const useUpdateNudgeConfig = (id: string) => {
  return useMutationBase<ConfigNudgeSchedulePayload, void>(
    (payload) => configAutoNudgeSchedule(id, payload),
    ["groups", id, "nudges", "auto"],
  );
};

/**
 * Hook to disable auto nudge for group
 *
 * @returns Mutation object for disabling nudge for group
 */
export const useDisableNudge = (id: string) => {
  return useMutationBase<string, void>((id) => disableNudge(id), ["groups", id, "nudges", "auto"]);
};
