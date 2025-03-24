import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { APIError } from "../schemas/error";

export type HealthcheckResponse = TypedResponse<
  paths["/healthcheck"]["get"]["responses"]["200"]["content"]["application/json"] | APIError
>;
