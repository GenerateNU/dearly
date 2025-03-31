import { TypedResponse } from "hono";
import { APIError } from "../schemas/error";
import { paths } from "../../../gen/openapi";

export type CreateUserResponse = TypedResponse<
  paths["/api/v1/users"]["post"]["responses"]["201"]["content"]["application/json"] | APIError
>;

export type GetUserResponse = TypedResponse<
  paths["/api/v1/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type UpdateUserResponse = TypedResponse<
  paths["/api/v1/users/me"]["patch"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type DeleteUserResponse = TypedResponse<
  paths["/api/v1/users/me"]["delete"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type RemoveDeviceTokenResponse = TypedResponse<
  | paths["/api/v1/users/devices"]["delete"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type AddDeviceTokenResponse = TypedResponse<
  | paths["/api/v1/users/devices"]["post"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type UserGroupsResponse = TypedResponse<
  paths["/api/v1/users/groups"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type SearchedUsersResponse = TypedResponse<
  paths["/api/v1/users/search"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;

export type UserNotificationResponses = TypedResponse<
  | paths["/api/v1/users/notifications"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
