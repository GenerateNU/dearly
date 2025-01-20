import { TypedResponse } from "hono";
import { API_ERROR } from "../schemas/error";
import { paths } from "../../../gen/openapi";

export type USER_RESPONSE = TypedResponse<
  paths["/api/v1/users"]["post"]["responses"]["201"]["content"]["application/json"] | API_ERROR
>;
export type DEL_USER = TypedResponse<
  paths["/api/v1/users/me"]["delete"]["responses"]["200"]["content"]["application/json"] | API_ERROR
>;
export type DEVICE_RESPONSE = TypedResponse<
  | paths["/api/v1/users/devices"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
export type USER_POSTS = TypedResponse<
  paths["/api/v1/users/posts"]["get"]["responses"]["200"]["content"]["application/json"] | API_ERROR
>;
export type USER_GROUPS = TypedResponse<
  | paths["/api/v1/users/groups"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
