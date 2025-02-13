import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type COMMENT_API = TypedResponse<
  | paths["/api/v1/comments/{id}/likes"]["patch"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type CREATE_COMMENT_API = TypedResponse<
  | paths["/api/v1/posts/{id}/comments"]["post"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type GET_COMMENT_API = TypedResponse<
  | paths["/api/v1/posts/{id}/comments"]["get"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;

export type DELETE_COMMENT_API = TypedResponse<
  | paths["/api/v1/comments/{id}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
