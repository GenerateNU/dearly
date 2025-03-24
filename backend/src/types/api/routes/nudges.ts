import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type ManualNudgeResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/manual"]["post"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type AutoNudgeResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto"]["put"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type GetNudgeConfigResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type DeactivateNudgeResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/auto/off"]["put"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
