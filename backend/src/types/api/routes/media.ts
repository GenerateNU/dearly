import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type GroupMediaResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/media"]["post"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type UserMediaResponse = TypedResponse<
  paths["/api/v1/users/media"]["post"]["responses"]["201"]["content"]["application/json"] | APIError
>;
