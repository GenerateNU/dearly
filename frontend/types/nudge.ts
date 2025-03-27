import { paths } from "@/gen/openapi";

export type ConfigNudgeSchedulePayload =
  paths["/api/v1/groups/{id}/nudges/auto"]["put"]["requestBody"]["content"]["application/json"];

export type NudgeSchedule =
  paths["/api/v1/groups/{id}/nudges/auto"]["get"]["responses"]["200"]["content"]["application/json"];

export type NoNudgeConfig = {
  message: string;
};

export type NudgeScheduleConfig = {
  id: string;
  groupId: string;
  frequency: string;
  daysOfWeek?: string[];
  day?: string;
  month?: string;
  nudgeAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const isNoNudgeConfig = (data: any): data is NoNudgeConfig => {
  return data && typeof data.message === "string";
};

export const isNudgeScheduleConfig = (data: any): data is NudgeScheduleConfig => {
  return (
    data &&
    typeof data.id === "string" &&
    typeof data.groupId === "string" &&
    typeof data.frequency === "string" &&
    typeof data.nudgeAt === "string" &&
    typeof data.isActive === "boolean" &&
    typeof data.createdAt === "string" &&
    typeof data.updatedAt === "string"
  );
};
