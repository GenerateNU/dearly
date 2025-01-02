import { pathsSchema } from "../../../gen/generated_zod";
import { components } from "../../../gen/schema";
import z from "zod"

export type USER_API = components["schemas"]["User"];

/**
 * Generated Zod Schemas might need more manual processing for example removing the id, and Zod objects.
 * This is not ideal and should serve only as an example.
 */
export const USER_BODY_ZOD =
  pathsSchema.shape["/api/v1/users"].shape["post"].shape["requestBody"].unwrap().shape["content"]
    .shape["application/json"].transform((schema) => { const { id, ...rest } = schema; return rest; }).pipe(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1)
      }));
