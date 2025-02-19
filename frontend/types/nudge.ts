import { paths } from "@/gen/openapi";

export type ConfigNudgeSchedulePayload =
  paths["/api/v1/groups/{id}/nudges/auto"]["put"]["requestBody"]["content"]["application/json"];

export type NudgeSchedule =
  paths["/api/v1/groups/{id}/nudges/auto"]["get"]["responses"]["200"]["content"]["application/json"];
