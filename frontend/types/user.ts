import { paths, components } from "@/gen/openapi";
export type User = components["schemas"]["User"];
export type CreateUserPayload =
  paths["/api/v1/users"]["post"]["requestBody"]["content"]["application/json"];
export type AgeGroup =
  paths["/api/v1/users"]["post"]["requestBody"]["content"]["application/json"]["ageGroup"];
