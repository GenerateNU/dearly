import { TypedResponse } from "hono";
import { components, paths } from "../../../gen/openapi";

export type GROUP_API = TypedResponse<
  | paths["/api/v1/groups"]["post"]["responses"]["201"]["content"]["application/json"]
  | components["schemas"]["Error"]
  | components["schemas"]["ValidationError"]
>;
