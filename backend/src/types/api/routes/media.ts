import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type GROUP_MEDIA = TypedResponse<
  | paths["/api/v1/groups/{id}/media"]["post"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type USER_MEDIA = TypedResponse<
  | paths["/api/v1/users/media"]["post"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;

export type WAVEFORM = TypedResponse<
  | paths["/media/processing/{url}"]["get"]["responses"]["201"]["content"]["application/json"]
  | API_ERROR
>;
