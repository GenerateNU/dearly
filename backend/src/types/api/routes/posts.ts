import { TypedResponse } from "hono";
import { components, paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type POST_API = TypedResponse<
  | paths["/api/v1/groups/{id}/posts"]["post"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;

export type DEL_POST = TypedResponse<
  | paths["/api/v1/posts/{id}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type LIKE_USERS = TypedResponse<
  | paths["/api/v1/posts/{id}/likes"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type TOGGLE_LIKE = TypedResponse<
  | paths["/api/v1/posts/{id}/likes"]["patch"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
