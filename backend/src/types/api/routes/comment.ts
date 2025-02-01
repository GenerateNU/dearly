import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type COMMENT_API = TypedResponse<
  | paths["/api/v1/comments/{id}/likes"]["patch"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
