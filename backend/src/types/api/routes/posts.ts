import { TypedResponse } from "hono";
import { components, paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type POST_API = TypedResponse<
  | paths["/api/v1/groups/{groupId}/posts"]["post"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;

export type DEL_POST = TypedResponse<
  | paths["/api/v1/groups/{groupId}/posts/{postId}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
