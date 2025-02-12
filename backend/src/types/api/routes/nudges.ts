import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type MANUAL_NUDGE = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/manual"]["post"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type AUTO_NUDGE = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto"]["post"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type NUDGES_API = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type DEACTIVE_NUDGE = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto"]["put"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
