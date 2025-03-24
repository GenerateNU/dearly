import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type CreateInviteResponse = TypedResponse<
  | paths["/api/v1/groups/{groupId}/invites"]["get"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;

export type VerifyTokenResponse = TypedResponse<
  | paths["/api/v1/groups/{token}/verify"]["put"]["responses"]["200"]["content"]["application/json"]
  | APIError
>;
