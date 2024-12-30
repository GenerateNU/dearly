import { pathsSchema } from "../../../gen/generated_zod";
import { components } from "../../../gen/schema";

export type USER_API = components["schemas"]["User"];

export const USER_BODY_ZOD =
  pathsSchema.shape["/api/v1/users"].shape["post"].shape["requestBody"].unwrap().shape["content"]
    .shape["application/json"];

