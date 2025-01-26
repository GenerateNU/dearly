import { TypedResponse } from "hono";
import { components, paths } from "../../../gen/openapi";
import { API_ERROR } from "./error";

export type GROUP_API = TypedResponse<
  | paths["/api/v1/groups"]["post"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;

export type CREATE_GROUP_INVITE = TypedResponse<
  | paths["/api/v1/groups/{groupId}/invites"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type VERIFY_GROUP_INVITE = TypedResponse<
  | paths["/api/v1/groups/{groupId}/{token}/verify"]["put"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
