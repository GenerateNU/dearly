import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type CreateGroupResponse = TypedResponse<
  paths["/api/v1/groups"]["post"]["responses"]["201"]["content"]["application/json"] | APIError
>;

export type GroupFeedResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/feed"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type GroupCalendarResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/calendar"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type DeleteGroupResponse = TypedResponse<
  | paths["/api/v1/groups/{id}"]["delete"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type UpdateGroupResponse = TypedResponse<
  | paths["/api/v1/groups/{id}"]["patch"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type GetGroupResponse = TypedResponse<
  paths["/api/v1/groups/{id}"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;
