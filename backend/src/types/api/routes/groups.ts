import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type GROUP_API = TypedResponse<
  paths["/api/v1/groups"]["post"]["responses"]["201"]["content"]["application/json"] | API_ERROR
>;

export type FEED_API = TypedResponse<
  | paths["/api/v1/groups/{id}/feed"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type CALENDAR_API = TypedResponse<
  | paths["/api/v1/groups/{id}/calendar"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type DELETE_GROUP = TypedResponse<
  | paths["/api/v1/groups/{id}"]["delete"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type PATCH_GROUP = TypedResponse<
  | paths["/api/v1/groups/{id}"]["patch"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type GET_GROUP = TypedResponse<
  paths["/api/v1/groups/{id}"]["get"]["responses"]["201"]["content"]["application/json"] | API_ERROR
>;
