import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type PatchCommentResponse = TypedResponse<
  | paths["/api/v1/comments/{id}/likes"]["patch"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type CreateCommentResponse = TypedResponse<
  | paths["/api/v1/posts/{id}/comments"]["post"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type GetCommentResponse = TypedResponse<
  | paths["/api/v1/posts/{id}/comments"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type DeleteCommentResponse = TypedResponse<
  | paths["/api/v1/comments/{id}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
