import { TypedResponse } from "hono";
import { components, paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type DELETE_GROUP = TypedResponse<
  | paths["/api/v1/groups/{id}"]["delete"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type PATCH_GROUP = TypedResponse<
  | paths["/api/v1/groups/{id}"]["patch"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;

export type GET_GROUP = TypedResponse<
  | paths["/api/v1/groups/{id}"]["get"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;
