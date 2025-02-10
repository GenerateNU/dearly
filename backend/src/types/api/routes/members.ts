import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type ADD_MEMBER = TypedResponse<
  | paths["/api/v1/groups/{id}/members/{userId}"]["post"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type DEL_MEMBER = TypedResponse<
  | paths["/api/v1/groups/{id}/members/{userId}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type MEMBERS_API = TypedResponse<
  | paths["/api/v1/groups/{id}/members"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type NOTIFICATION = TypedResponse<
  | paths["/api/v1/groups/{id}/members/notifications"]["patch"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
