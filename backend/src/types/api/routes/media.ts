import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type MEDIA = TypedResponse<
  | paths["/api/v1/groups/{id}/media"]["get"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;
