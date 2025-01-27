import { TypedResponse } from "hono";
import { paths } from "../../../gen/openapi";
import { API_ERROR } from "../schemas/error";

export type HEALTHCHECK = TypedResponse<
  paths["/healthcheck"]["get"]["responses"]["200"]["content"]["application/json"] | API_ERROR
>;
