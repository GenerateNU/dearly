import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type CreatePostResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/posts"]["post"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type GetPostResponse = TypedResponse<
  paths["/api/v1/posts/{id}"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type UpdatePostResponse = TypedResponse<
  paths["/api/v1/posts/{id}"]["patch"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type DeletePostResponse = TypedResponse<
  | paths["/api/v1/posts/{id}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type LikeUsersResponse = TypedResponse<
  | paths["/api/v1/posts/{id}/likes"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type ToggleLikeResponse = TypedResponse<
  | paths["/api/v1/posts/{id}/likes"]["patch"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
