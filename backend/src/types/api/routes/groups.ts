import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type FEED_API = TypedResponse<
  | paths["/api/v1/groups/{id}/feed"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type CALENDAR_API = TypedResponse<
  | paths["/api/v1/groups/{id}/calendar"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
