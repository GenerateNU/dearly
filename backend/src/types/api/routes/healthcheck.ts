import { TypedResponse } from "hono";
import { paths } from "../../../gen/schema";

export type HEALTHCHECK = TypedResponse<
  paths["/healthcheck"]["get"]["responses"]["200"]["content"]["application/json"]
>;
