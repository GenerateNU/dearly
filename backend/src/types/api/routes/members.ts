import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type AddMemberResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members/{userId}"]["post"]["responses"]["201"]["content"]["application/json"]
  | APIError
>;

export type GetAMemberResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members/info"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type DeleteMemberResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members/{userId}"]["delete"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type GetMembersResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type UpdateNotificationResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members/notifications"]["patch"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type GetMemberPostsResponse = TypedResponse<
  | paths["/api/v1/groups/{id}/members/{userId}/posts"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
