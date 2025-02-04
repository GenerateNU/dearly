import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type MANUAL_NUDGE = TypedResponse<
  | paths["/api/v1/groups/{id}/nudges/manual"]["put"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
